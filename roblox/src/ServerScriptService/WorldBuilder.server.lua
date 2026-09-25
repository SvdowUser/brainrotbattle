local CollectionService = game:GetService("CollectionService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Lighting = game:GetService("Lighting")

local TownConfig = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("TownConfig"))

local TILE = TownConfig.TileSize
local world = workspace:FindFirstChild("BrainrotWorld")

if world then
	world:Destroy()
end

world = Instance.new("Folder")
world.Name = "BrainrotWorld"
world.Parent = workspace

local function tileToWorld(x, y, height)
	local originX = -((TownConfig.Width - 1) * TILE) / 2
	local originZ = -((TownConfig.Height - 1) * TILE) / 2
	return Vector3.new(
		originX + x * TILE,
		height or 0,
		originZ + y * TILE
	)
end

local function makePart(parent, name, size, cframe, color, material, canCollide, transparency)
	local part = Instance.new("Part")
	part.Name = name
	part.Anchored = true
	part.Size = size
	part.CFrame = cframe
	part.Color = color
	part.Material = material or Enum.Material.SmoothPlastic
	part.CanCollide = canCollide ~= false
	part.Transparency = transparency or 0
	part.TopSurface = Enum.SurfaceType.Smooth
	part.BottomSurface = Enum.SurfaceType.Smooth
	part.Parent = parent
	return part
end

-- Base ground.
local ground = makePart(
	world,
	"Ground",
	Vector3.new(TownConfig.Width * TILE, 2, TownConfig.Height * TILE),
	CFrame.new(0, -1, 0),
	Color3.fromRGB(104, 177, 73),
	Enum.Material.Grass,
	true,
	0
)

-- A simple cross-road gives the first Studio build a readable town layout.
local horizontalZ = tileToWorld(0, 11, 0.15).Z
makePart(
	world,
	"EastWestRoad",
	Vector3.new(TownConfig.Width * TILE, 0.3, TILE * 2.2),
	CFrame.new(0, 0.15, horizontalZ),
	Color3.fromRGB(211, 190, 147),
	Enum.Material.Ground,
	false,
	0
)

local verticalX = tileToWorld(9, 0, 0.16).X
makePart(
	world,
	"NorthSouthRoad",
	Vector3.new(TILE * 2.2, 0.32, TownConfig.Height * TILE),
	CFrame.new(verticalX, 0.16, 0),
	Color3.fromRGB(211, 190, 147),
	Enum.Material.Ground,
	false,
	0
)

-- Port the web collision grid as invisible Roblox collision volumes.
local barriers = Instance.new("Folder")
barriers.Name = "ImportedCollision"
barriers.Parent = world

for y = 0, TownConfig.Height - 1 do
	for x = 0, TownConfig.Width - 1 do
		if TownConfig.isBlocked(x, y) then
			local position = tileToWorld(x, y, 3)
			local part = makePart(
				barriers,
				("C_%02d_%02d"):format(x, y),
				Vector3.new(TILE, 6, TILE),
				CFrame.new(position),
				Color3.new(1, 1, 1),
				Enum.Material.SmoothPlastic,
				true,
				1
			)
			part.CanQuery = false
		end
	end
end

local interiors = Instance.new("Folder")
interiors.Name = "Interiors"
interiors.Parent = world

local function teleportPlayer(player, position)
	local character = player.Character
	if character then
		character:PivotTo(CFrame.new(position))
	end
end

local function addPrompt(part, objectText, actionText, callback)
	local prompt = Instance.new("ProximityPrompt")
	prompt.ObjectText = objectText
	prompt.ActionText = actionText
	prompt.HoldDuration = 0
	prompt.MaxActivationDistance = 10
	prompt.RequiresLineOfSight = false
	prompt.Parent = part
	prompt.Triggered:Connect(callback)
	return prompt
end

local function buildInterior(index, landmark)
	local offset = Vector3.new(500 + index * 130, 0, 0)
	local folder = Instance.new("Folder")
	folder.Name = landmark.id
	folder.Parent = interiors

	makePart(
		folder,
		"Floor",
		Vector3.new(90, 1, 70),
		CFrame.new(offset + Vector3.new(0, 0, 0)),
		Color3.fromRGB(234, 222, 199),
		Enum.Material.WoodPlanks,
		true,
		0
	)

	local wallColor = Color3.fromRGB(245, 238, 220)
	makePart(folder, "NorthWall", Vector3.new(90, 18, 2), CFrame.new(offset + Vector3.new(0, 9, -35)), wallColor, Enum.Material.Plaster, true, 0)
	makePart(folder, "SouthWall", Vector3.new(90, 18, 2), CFrame.new(offset + Vector3.new(0, 9, 35)), wallColor, Enum.Material.Plaster, true, 0)
	makePart(folder, "WestWall", Vector3.new(2, 18, 70), CFrame.new(offset + Vector3.new(-45, 9, 0)), wallColor, Enum.Material.Plaster, true, 0)
	makePart(folder, "EastWall", Vector3.new(2, 18, 70), CFrame.new(offset + Vector3.new(45, 9, 0)), wallColor, Enum.Material.Plaster, true, 0)

	local exit = makePart(
		folder,
		"Exit",
		Vector3.new(12, 1, 8),
		CFrame.new(offset + Vector3.new(0, 0.6, 28)),
		Color3.fromRGB(255, 215, 92),
		Enum.Material.Neon,
		false,
		0.35
	)

	local outside = tileToWorld(landmark.door.x, landmark.door.y + 1, 4)
	addPrompt(exit, landmark.name, "Exit", function(player)
		teleportPlayer(player, outside)
	end)

	return offset + Vector3.new(0, 4, 20)
end

local landmarksFolder = Instance.new("Folder")
landmarksFolder.Name = "Landmarks"
landmarksFolder.Parent = world

for index, landmark in ipairs(TownConfig.Landmarks) do
	local doorWorld = tileToWorld(landmark.door.x, landmark.door.y, 0)
	local model = Instance.new("Model")
	model.Name = landmark.id
	model.Parent = landmarksFolder

	local body = makePart(
		model,
		"Building",
		Vector3.new(TILE * 3.2, 15, TILE * 2.5),
		CFrame.new(doorWorld + Vector3.new(0, 7.5, -TILE * 1.25)),
		landmark.color,
		Enum.Material.SmoothPlastic,
		false,
		0
	)

	local roof = makePart(
		model,
		"Roof",
		Vector3.new(TILE * 3.7, 3, TILE * 2.9),
		CFrame.new(body.Position + Vector3.new(0, 9, 0)),
		landmark.color:Lerp(Color3.new(0, 0, 0), 0.22),
		Enum.Material.Slate,
		false,
		0
	)
	roof.Orientation = Vector3.new(0, 0, 0)

	local door = makePart(
		model,
		"Door",
		Vector3.new(TILE * 0.75, 8, 1),
		CFrame.new(doorWorld + Vector3.new(0, 4, -0.5)),
		Color3.fromRGB(95, 62, 42),
		Enum.Material.Wood,
		false,
		0
	)

	local interiorSpawn = buildInterior(index, landmark)
	addPrompt(door, landmark.name, "Enter", function(player)
		teleportPlayer(player, interiorSpawn)
	end)

	local billboard = Instance.new("BillboardGui")
	billboard.Size = UDim2.fromOffset(180, 42)
	billboard.StudsOffset = Vector3.new(0, 8, 0)
	billboard.AlwaysOnTop = true
	billboard.Parent = door

	local label = Instance.new("TextLabel")
	label.Size = UDim2.fromScale(1, 1)
	label.BackgroundTransparency = 1
	label.Text = landmark.name
	label.TextScaled = true
	label.Font = Enum.Font.GothamBold
	label.TextColor3 = Color3.new(1, 1, 1)
	label.TextStrokeTransparency = 0.35
	label.Parent = billboard
end

-- Native tall grass trigger volumes for encounters.
local encounterFolder = Instance.new("Folder")
encounterFolder.Name = "EncounterZones"
encounterFolder.Parent = world

for index, zone in ipairs(TownConfig.EncounterZones) do
	local centerX = (zone.x0 + zone.x1) / 2
	local centerY = (zone.y0 + zone.y1) / 2
	local width = (zone.x1 - zone.x0 + 1) * TILE
	local depth = (zone.y1 - zone.y0 + 1) * TILE
	local position = tileToWorld(centerX, centerY, 0.45)

	local grass = makePart(
		encounterFolder,
		("TallGrass_%d"):format(index),
		Vector3.new(width, 0.9, depth),
		CFrame.new(position),
		Color3.fromRGB(67, 133, 67),
		Enum.Material.Grass,
		false,
		0.25
	)
	grass.CanTouch = true
	CollectionService:AddTag(grass, "BrainrotEncounterZone")
end

local spawnPosition = tileToWorld(TownConfig.Spawn.x, TownConfig.Spawn.y, 2)
local spawn = Instance.new("SpawnLocation")
spawn.Name = "TownSpawn"
spawn.Size = Vector3.new(TILE, 1, TILE)
spawn.Position = spawnPosition
spawn.Anchored = true
spawn.Neutral = true
spawn.Transparency = 1
spawn.CanCollide = false
spawn.Parent = world

Lighting.ClockTime = 10.5
Lighting.Brightness = 2.2
Lighting.EnvironmentDiffuseScale = 0.55
Lighting.EnvironmentSpecularScale = 0.35
Lighting.Ambient = Color3.fromRGB(145, 156, 170)
