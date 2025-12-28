# 🐍 Snake Game

A beautiful, modern Snake game built with vanilla JavaScript, HTML, and CSS. Play the classic game with smooth controls and a polished UI!

## Features

- 🎮 Classic Snake gameplay
- 🎨 Modern, gradient-based UI design
- 📱 Touch controls for mobile devices
- ⌨️ Keyboard controls (Arrow keys or WASD)
- 💾 High score tracking (saved in localStorage)
- 🎯 Smooth animations and visual effects

## How to Play

1. **Start the game**: Click "Start Game" or press Enter/Space
2. **Control the snake**: 
   - Use arrow keys or WASD
   - Or use the on-screen control buttons
3. **Objective**: Eat the red food to grow longer and increase your score
4. **Avoid**: Hitting the walls or your own tail!

## Running Locally

### Option 1: Python HTTP Server (Recommended)

```bash
# Python 3
python3 -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

Then open your browser and navigate to: `http://localhost:8000`

### Option 2: Node.js HTTP Server

If you have Node.js installed:

```bash
npx http-server -p 8000
```

Then open: `http://localhost:8000`

### Option 3: VS Code Live Server

If you're using VS Code, install the "Live Server" extension and right-click on `index.html` → "Open with Live Server"

## Game Controls

- **Arrow Keys** or **WASD**: Move the snake
- **Enter** or **Space**: Start/Restart game
- **Touch Controls**: Use the on-screen buttons on mobile devices

## Deploy to GitHub Pages

Yes! This game can be easily hosted on GitHub Pages. Here's how:

### Step 1: Create a GitHub Repository

1. Go to [GitHub](https://github.com) and create a new repository
2. Name it something like `snake-game` or `my-snake-game`
3. Don't initialize with README (you already have one)

### Step 2: Push Your Code

```bash
cd snake_game
git init
git add .
git commit -m "Initial commit: Snake game"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

### Step 3: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section (in the left sidebar)
4. Under **Source**, select **Deploy from a branch**
5. Choose **main** branch and **/ (root)** folder
6. Click **Save**

### Step 4: Access Your Game

Your game will be live at:
```
https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
```

GitHub Pages usually takes 1-2 minutes to deploy. You'll see a green checkmark when it's ready!

**Note:** If your repository is named `snake-game`, your URL will be:
```
https://YOUR_USERNAME.github.io/snake-game/
```

## Technologies Used

- HTML5 Canvas
- Vanilla JavaScript (ES6+)
- CSS3 (Gradients, Animations, Flexbox)
- LocalStorage API (for high score persistence)

Enjoy the game! 🎮

