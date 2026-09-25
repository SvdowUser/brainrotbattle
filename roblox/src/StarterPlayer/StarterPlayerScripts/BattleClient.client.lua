local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local player = Players.LocalPlayer
local remotes = ReplicatedStorage:WaitForChild("BrainrotRemotes")
local battleStarted = remotes:WaitForChild("BattleStarted")
local battleAction = remotes:WaitForChild("BattleAction")
local battleUpdated = remotes:WaitForChild("BattleUpdated")
local battleEnded = remotes:WaitForChild("BattleEnded")

local gui = Instance.new("ScreenGui")
gui.Name = "BrainrotBattleUI"
gui.ResetOnSpawn = false
gui.IgnoreGuiInset = true
gui.Enabled = false
gui.Parent = player:WaitForChild("PlayerGui")

local dim = Instance.new("Frame")
dim.Size = UDim2.fromScale(1, 1)
dim.BackgroundColor3 = Color3.fromRGB(10, 15, 25)
dim.BackgroundTransparency = 0.12
dim.Parent = gui

local panel = Instance.new("Frame")
panel.AnchorPoint = Vector2.new(0.5, 1)
panel.Position = UDim2.fromScale(0.5, 0.96)
panel.Size = UDim2.new(0.88, 0, 0, 250)
panel.BackgroundColor3 = Color3.fromRGB(25, 30, 43)
panel.BorderSizePixel = 0
panel.Parent = gui

local corner = Instance.new("UICorner")
corner.CornerRadius = UDim.new(0, 18)
corner.Parent = panel

local title = Instance.new("TextLabel")
title.BackgroundTransparency = 1
title.Position = UDim2.fromOffset(22, 16)
title.Size = UDim2.new(1, -44, 0, 42)
title.Font = Enum.Font.GothamBold
title.TextColor3 = Color3.new(1, 1, 1)
title.TextScaled = true
title.TextXAlignment = Enum.TextXAlignment.Left
title.Parent = panel

local status = Instance.new("TextLabel")
status.BackgroundTransparency = 1
status.Position = UDim2.fromOffset(22, 64)
status.Size = UDim2.new(1, -44, 0, 62)
status.Font = Enum.Font.Gotham
status.TextColor3 = Color3.fromRGB(225, 232, 242)
status.TextWrapped = true
status.TextScaled = true
status.TextXAlignment = Enum.TextXAlignment.Left
status.Parent = panel

local health = Instance.new("TextLabel")
health.BackgroundTransparency = 1
health.Position = UDim2.fromOffset(22, 126)
health.Size = UDim2.new(1, -44, 0, 38)
health.Font = Enum.Font.GothamSemibold
health.TextColor3 = Color3.fromRGB(137, 231, 159)
health.TextScaled = true
health.TextXAlignment = Enum.TextXAlignment.Left
health.Parent = panel

local buttons = Instance.new("Frame")
buttons.BackgroundTransparency = 1
buttons.Position = UDim2.fromOffset(18, 174)
buttons.Size = UDim2.new(1, -36, 0, 58)
buttons.Parent = panel

local layout = Instance.new("UIListLayout")
layout.FillDirection = Enum.FillDirection.Horizontal
layout.HorizontalAlignment = Enum.HorizontalAlignment.Center
layout.Padding = UDim.new(0, 10)
layout.Parent = buttons

local active = false

local function makeButton(text, action)
	local button = Instance.new("TextButton")
	button.Size = UDim2.new(0.31, 0, 1, 0)
	button.BackgroundColor3 = Color3.fromRGB(58, 88, 150)
	button.TextColor3 = Color3.new(1, 1, 1)
	button.Font = Enum.Font.GothamBold
	button.TextScaled = true
	button.Text = text
	button.AutoButtonColor = true
	button.Parent = buttons

	local buttonCorner = Instance.new("UICorner")
	buttonCorner.CornerRadius = UDim.new(0, 12)
	buttonCorner.Parent = button

	button.Activated:Connect(function()
		if active then
			battleAction:FireServer(action)
		end
	end)
end

makeButton("FIGHT", "fight")
makeButton("CATCH", "catch")
makeButton("RUN", "run")

local function render(state, message)
	if not state then
		return
	end
	title.Text = state.wild.name .. "  •  " .. string.upper(state.wild.rarity)
	status.Text = message or ""
	health.Text = string.format(
		"Wild HP %d/%d    |    %s HP %d/%d",
		state.wild.currentHP,
		state.wild.hp,
		state.mine.name,
		state.mine.currentHP,
		state.mine.hp
	)
end

battleStarted.OnClientEvent:Connect(function(state, message)
	active = true
	gui.Enabled = true
	render(state, message)
end)

battleUpdated.OnClientEvent:Connect(function(state, message)
	render(state, message)
end)

battleEnded.OnClientEvent:Connect(function(_result, message, state)
	active = false
	render(state, message)
	task.delay(1.4, function()
		if not active then
			gui.Enabled = false
		end
	end)
end)
