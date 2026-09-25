local DataStoreService = game:GetService("DataStoreService")

local STORE = DataStoreService:GetDataStore("BrainrotBattlePlayer_v1")

local PlayerProfile = {}
local cache = {}

local function defaultProfile()
	return {
		starterId = 1,
		brainDex = { 1 },
		caught = { ["1"] = 1 },
		brainGold = 100,
		orbs = {
			brain = 10,
			glitch = 3,
			rare = 1,
		},
	}
end

local function dexCount(profile)
	return #profile.brainDex
end

local function applyAttributes(player, profile)
	player:SetAttribute("StarterId", profile.starterId)
	player:SetAttribute("BrainGold", profile.brainGold)
	player:SetAttribute("BrainDexCount", dexCount(profile))
	player:SetAttribute("BrainOrbs", profile.orbs.brain or 0)
end

function PlayerProfile.Load(player)
	local key = ("u_%d"):format(player.UserId)
	local profile

	local ok, result = pcall(function()
		return STORE:GetAsync(key)
	end)

	if ok and type(result) == "table" then
		profile = result
	else
		profile = defaultProfile()
		if not ok then
			warn("BrainrotBattle DataStore load failed; using session profile:", result)
		end
	end

	cache[player] = profile
	applyAttributes(player, profile)
	return profile
end

function PlayerProfile.Get(player)
	return cache[player]
end

function PlayerProfile.AddCaught(player, brainrotId)
	local profile = cache[player]
	if not profile then
		return
	end

	local idKey = tostring(brainrotId)
	profile.caught[idKey] = (profile.caught[idKey] or 0) + 1

	local exists = false
	for _, id in ipairs(profile.brainDex) do
		if id == brainrotId then
			exists = true
			break
		end
	end

	if not exists then
		table.insert(profile.brainDex, brainrotId)
	end

	applyAttributes(player, profile)
end

function PlayerProfile.Save(player)
	local profile = cache[player]
	if not profile then
		return
	end

	local key = ("u_%d"):format(player.UserId)
	local ok, err = pcall(function()
		STORE:UpdateAsync(key, function()
			return profile
		end)
	end)

	if not ok then
		warn("BrainrotBattle DataStore save failed:", err)
	end
end

function PlayerProfile.Release(player)
	PlayerProfile.Save(player)
	cache[player] = nil
end

return PlayerProfile
