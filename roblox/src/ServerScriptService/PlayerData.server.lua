local Players = game:GetService("Players")

local PlayerProfile = require(script.Parent:WaitForChild("PlayerProfile"))

Players.PlayerAdded:Connect(function(player)
	PlayerProfile.Load(player)
end)

Players.PlayerRemoving:Connect(function(player)
	PlayerProfile.Release(player)
end)

for _, player in ipairs(Players:GetPlayers()) do
	task.spawn(PlayerProfile.Load, player)
end

game:BindToClose(function()
	for _, player in ipairs(Players:GetPlayers()) do
		PlayerProfile.Save(player)
	end
end)
