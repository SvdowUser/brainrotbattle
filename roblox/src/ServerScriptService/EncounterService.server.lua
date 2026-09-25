local CollectionService = game:GetService("CollectionService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local BrainrotData = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("BrainrotData"))
local PlayerProfile = require(script.Parent:WaitForChild("PlayerProfile"))

local remotes = ReplicatedStorage:FindFirstChild("BrainrotRemotes")
if not remotes then
	remotes = Instance.new("Folder")
	remotes.Name = "BrainrotRemotes"
	remotes.Parent = ReplicatedStorage
end

local function remoteEvent(name)
	local event = remotes:FindFirstChild(name)
	if not event then
		event = Instance.new("RemoteEvent")
		event.Name = name
		event.Parent = remotes
	end
	return event
end

local battleStarted = remoteEvent("BattleStarted")
local battleAction = remoteEvent("BattleAction")
local battleUpdated = remoteEvent("BattleUpdated")
local battleEnded = remoteEvent("BattleEnded")

local rng = Random.new()
local activeBattles = {}
local encounterCooldown = {}

local function freeze(player)
	local character = player.Character
	local humanoid = character and character:FindFirstChildOfClass("Humanoid")
	if not humanoid then
		return nil
	end

	local old = {
		walkSpeed = humanoid.WalkSpeed,
		jumpPower = humanoid.JumpPower,
		autoRotate = humanoid.AutoRotate,
	}

	humanoid.WalkSpeed = 0
	humanoid.JumpPower = 0
	humanoid.AutoRotate = false
	return old
end

local function unfreeze(player, old)
	if not old then
		return
	end
	local character = player.Character
	local humanoid = character and character:FindFirstChildOfClass("Humanoid")
	if humanoid then
		humanoid.WalkSpeed = old.walkSpeed
		humanoid.JumpPower = old.jumpPower
		humanoid.AutoRotate = old.autoRotate
	end
end

local function snapshot(state)
	return {
		wild = {
			id = state.wild.id,
			name = state.wild.name,
			rarity = state.wild.rarity,
			hp = state.wild.hp,
			currentHP = state.wildHP,
		},
		mine = {
			id = state.mine.id,
			name = state.mine.name,
			hp = state.mine.hp,
			currentHP = state.mineHP,
		},
	}
end

local function finish(player, result, message)
	local state = activeBattles[player]
	if not state then
		return
	end

	activeBattles[player] = nil
	unfreeze(player, state.movement)
	battleEnded:FireClient(player, result, message, snapshot(state))
end

local function startBattle(player)
	if activeBattles[player] then
		return
	end

	local profile = PlayerProfile.Get(player)
	if not profile then
		return
	end

	local wild = BrainrotData.randomCommon(rng)
	local mine = BrainrotData.get(profile.starterId) or BrainrotData.get(1)

	local state = {
		wild = wild,
		mine = mine,
		wildHP = wild.hp,
		mineHP = mine.hp,
		movement = freeze(player),
	}

	activeBattles[player] = state
	battleStarted:FireClient(player, snapshot(state), ("A wild %s appeared!"):format(wild.name))
end

local function enemyTurn(player, state)
	if state.wildHP <= 0 then
		return
	end

	local damage = math.max(1, state.wild.atk + rng:NextInteger(-2, 2))
	state.mineHP = math.max(0, state.mineHP - damage)

	if state.mineHP <= 0 then
		finish(player, "lost", ("%s knocked out your %s."):format(state.wild.name, state.mine.name))
		return
	end

	battleUpdated:FireClient(
		player,
		snapshot(state),
		("%s hit back for %d damage."):format(state.wild.name, damage)
	)
end

battleAction.OnServerEvent:Connect(function(player, action)
	local state = activeBattles[player]
	if not state or type(action) ~= "string" then
		return
	end

	if action == "fight" then
		local damage = math.max(1, state.mine.atk + rng:NextInteger(-2, 3))
		state.wildHP = math.max(0, state.wildHP - damage)

		if state.wildHP <= 0 then
			finish(player, "won", ("%s won the battle!"):format(state.mine.name))
			return
		end

		battleUpdated:FireClient(
			player,
			snapshot(state),
			("%s dealt %d damage."):format(state.mine.name, damage)
		)
		task.delay(0.55, function()
			if activeBattles[player] == state then
				enemyTurn(player, state)
			end
		end)

	elseif action == "catch" then
		local missingHpRatio = 1 - (state.wildHP / state.wild.hp)
		local chance = math.clamp(state.wild.catchRate + missingHpRatio * 0.28, 0.05, 0.92)

		if rng:NextNumber() <= chance then
			PlayerProfile.AddCaught(player, state.wild.id)
			finish(player, "caught", ("Caught %s!"):format(state.wild.name))
			return
		end

		battleUpdated:FireClient(player, snapshot(state), ("%s broke free!"):format(state.wild.name))
		task.delay(0.55, function()
			if activeBattles[player] == state then
				enemyTurn(player, state)
			end
		end)

	elseif action == "run" then
		if rng:NextNumber() <= 0.75 then
			finish(player, "ran", "Got away safely.")
		else
			battleUpdated:FireClient(player, snapshot(state), "Couldn't escape!")
			task.delay(0.45, function()
				if activeBattles[player] == state then
					enemyTurn(player, state)
				end
			end)
		end
	end
end)

local function onZoneTouched(hit)
	local character = hit:FindFirstAncestorOfClass("Model")
	local player = character and Players:GetPlayerFromCharacter(character)
	if not player or activeBattles[player] then
		return
	end

	local now = os.clock()
	if now < (encounterCooldown[player] or 0) then
		return
	end
	encounterCooldown[player] = now + 2.5

	if rng:NextNumber() <= 0.22 then
		startBattle(player)
	end
end

local connected = {}

local function connectZone(zone)
	if connected[zone] then
		return
	end
	connected[zone] = true
	zone.Touched:Connect(onZoneTouched)
end

for _, zone in ipairs(CollectionService:GetTagged("BrainrotEncounterZone")) do
	connectZone(zone)
end

CollectionService:GetInstanceAddedSignal("BrainrotEncounterZone"):Connect(connectZone)

Players.PlayerRemoving:Connect(function(player)
	activeBattles[player] = nil
	encounterCooldown[player] = nil
end)
