-- Coordinates are ported from the current browser game's mapsConfig/mapCollisions files.
-- Tile coordinates are zero-based to stay compatible with the web source.

local TownConfig = {}

TownConfig.TileSize = 12
TownConfig.Width = 25
TownConfig.Height = 23
TownConfig.Spawn = { x = 9, y = 11 }

-- 1 = blocked, 0 = walkable. Each string is one row of the current web collision map.
TownConfig.CollisionRows = {
	"1111111111111111111111111",
	"1111110111111111111111111",
	"1111111111111111111111111",
	"1111111100001111111111111",
	"1111111100001111111111111",
	"1111000000000000111111111",
	"1111000000000000011111111",
	"1100000000000000001111111",
	"1101000000000101101111111",
	"1110110100000000001111111",
	"1101011100000000001111111",
	"1110000000000000000011111",
	"1100000001000000000011111",
	"0000000000100000000011111",
	"0000000000000000000011111",
	"1100000100000000001111111",
	"1100000000000000001111111",
	"1100000000000000001111111",
	"1100010110000011011111111",
	"1111000000000001111111111",
	"1111000000000000001111111",
	"1111000000000000111111111",
	"1111111111111111111111111",
}

TownConfig.Landmarks = {
	{
		id = "house_a",
		name = "Trainer House",
		door = { x = 3, y = 7 },
		color = Color3.fromRGB(213, 141, 79),
	},
	{
		id = "shop",
		name = "Brain Shop",
		door = { x = 14, y = 8 },
		color = Color3.fromRGB(67, 133, 214),
	},
	{
		id = "center_b1",
		name = "Brain Center",
		door = { x = 3, y = 12 },
		color = Color3.fromRGB(221, 74, 83),
	},
	{
		id = "house_b",
		name = "South House",
		door = { x = 13, y = 17 },
		color = Color3.fromRGB(196, 158, 103),
	},
}

-- Native Roblox encounter zones. These approximate the north/south tall-grass areas
-- from the older town layout until the final 3D environment is authored.
TownConfig.EncounterZones = {
	{ x0 = 6, y0 = 3, x1 = 11, y1 = 5 },
	{ x0 = 5, y0 = 19, x1 = 15, y1 = 21 },
}

function TownConfig.isBlocked(x, y)
	if x < 0 or x >= TownConfig.Width or y < 0 or y >= TownConfig.Height then
		return true
	end
	local row = TownConfig.CollisionRows[y + 1]
	return string.sub(row, x + 1, x + 1) == "1"
end

return TownConfig
