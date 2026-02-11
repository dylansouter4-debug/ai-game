import { FileNode } from '../types';

const INITIAL_C3PROJ = `{
  "name": "TopDownShooter",
  "version": "1.0.0.0",
  "author": "C3 Forge User",
  "uniqueId": "12345678-1234-1234-1234-123456789012",
  "next_uid": 100,
  "project_settings": {
    "pixel_rounding": false,
    "use_loader_layout": false
  },
  "objectTypes": [],
  "families": [],
  "layouts": [],
  "eventSheets": []
}`;

const INITIAL_MAIN_JS = `
// Import any other script files here, e.g.
// import * as myModule from "./myModule.js";

runOnStartup(async runtime => {
	// Code to run on the loading screen.
	// Note layouts, objects etc. are not yet available.
	
	runtime.addEventListener("beforeprojectstart", () => OnBeforeProjectStart(runtime));
});

async function OnBeforeProjectStart(runtime)
{
	// Code to run just before 'On start of layout' on the first layout.
	// Loading has finished and initial instances are created and available.
	
	runtime.addEventListener("tick", () => Tick(runtime));
}

function Tick(runtime)
{
	// Code to run every tick
    const dt = runtime.dt;
    
    // Example: Player Logic
    const player = runtime.objects.Player?.getFirstInstance();
    if (player) {
        // Basic Top-Down Movement
        const speed = 200;
        const keyboard = runtime.keyboard;
        
        if (keyboard) {
            if (keyboard.isKeyDown("ArrowRight")) player.x += speed * dt;
            if (keyboard.isKeyDown("ArrowLeft")) player.x -= speed * dt;
            if (keyboard.isKeyDown("ArrowUp")) player.y -= speed * dt;
            if (keyboard.isKeyDown("ArrowDown")) player.y += speed * dt;
            
            // Mouse Aiming
            const mouse = runtime.mouse;
            if (mouse) {
                const mouseX = mouse.getMouseX();
                const mouseY = mouse.getMouseY();
                const angle = Math.atan2(mouseY - player.y, mouseX - player.x);
                player.angle = angle;
            }
        }
    }
}
`;

const INITIAL_EVENT_SHEET = `{
  "name": "EventSheet1",
  "events": [
    {
      "eventType": "block",
      "conditions": [
        { "id": "system-on-start-of-layout" }
      ],
      "actions": [
        { "id": "system-log", "parameters": ["Game Started"] }
      ]
    }
  ]
}`;

export const getInitialProjectStructure = (): FileNode[] => [
  {
    id: 'root-project',
    name: 'project.c3proj',
    type: 'file',
    content: INITIAL_C3PROJ
  },
  {
    id: 'folder-scripts',
    name: 'scripts',
    type: 'folder',
    isOpen: true,
    children: [
      {
        id: 'file-main-js',
        name: 'main.js',
        type: 'file',
        content: INITIAL_MAIN_JS
      },
      {
        id: 'file-utils-js',
        name: 'utils.js',
        type: 'file',
        content: '// Utility functions for the game\n\nexport function getDistance(x1, y1, x2, y2) {\n\treturn Math.sqrt((x2-x1)**2 + (y2-y1)**2);\n}'
      }
    ]
  },
  {
    id: 'folder-events',
    name: 'eventSheets',
    type: 'folder',
    isOpen: false,
    children: [
      {
        id: 'file-es1',
        name: 'EventSheet1.json',
        type: 'file',
        content: INITIAL_EVENT_SHEET
      }
    ]
  },
  {
    id: 'folder-images',
    name: 'images',
    type: 'folder',
    isOpen: false,
    children: [
        {
            id: 'file-placeholder-png',
            name: 'shared-0-sheet0.png',
            type: 'file',
            content: '(Binary content placeholder)'
        }
    ]
  }
];
