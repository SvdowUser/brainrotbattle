-- Ported from src/data/brainrods.js.
-- The first five entries keep the same gameplay stats as the web version.

local BrainrotData = {
	[1] = {
		id = 1,
		name = "Tung Tung Tung Sahur",
		type = "Rhythm",
		rarity = "common",
		hp = 32,
		atk = 9,
		catchRate = 0.55,
	},
	[2] = {
		id = 2,
		name = "Tralalero Tralala",
		type = "Water",
		rarity = "common",
		hp = 28,
		atk = 8,
		catchRate = 0.55,
	},
	[3] = {
		id = 3,
		name = "Brrr Brrr Patapim",
		type = "Ice",
		rarity = "common",
		hp = 35,
		atk = 7,
		catchRate = 0.55,
	},
	[4] = {
		id = 4,
		name = "Chimpanzini Bananini",
		type = "Nature",
		rarity = "common",
		hp = 30,
		atk = 10,
		catchRate = 0.55,
	},
	[5] = {
		id = 5,
		name = "Tracallero Tracallà",
		type = "Earth",
		rarity = "common",
		hp = 38,
		atk = 6,
		catchRate = 0.55,
	},
}

function BrainrotData.get(id)
	return BrainrotData[id]
end

function BrainrotData.randomCommon(rng)
	local id = rng:NextInteger(1, 5)
	return BrainrotData[id]
end

return BrainrotData
