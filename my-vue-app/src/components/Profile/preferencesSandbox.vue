<template>
  <div class="container">
    <div ref="matterContainer" class="matter-container" style="border-radius: 5rem;">
      <p v-if="!hasInitialized">Loading...</p>
    </div>
  </div>
</template>

<script>
import Matter from 'matter-js';
import { getUserDataFromFirestore, listenForUserPreferenceUpdates } from '../../composables/profile';
import { nextTick } from 'vue';

export default {
  name: 'PreferencesSandbox',
  data() {
    return {
      engine: null,
      render: null,
      runner: null,
      categoryPills: [],
      ccaPills: [],
      walls: [],
      userData: null,
      resizeTimeout: null,
      resizeObserver: null,
      wallThickness: 50,
      pillStyles: {
        category: {
          height: 50,
          color: '#FE3E73', // Categories Pills Color
          minWidth: 100,
          padding: 40,
          textColor: 'white', // White text for Categories
          fontWeight: '700',   // Semi Bold
        },
        cca: {
          height: 50,
          color: '#D3FE3E', // CCA Pills Color
          minWidth: 100,
          padding: 40,
          textColor: 'black', // Black text for CCAs
          fontWeight: '700',   // 
        }
      },
      canvasWidth: 0,
      canvasHeight: 0,
      unsubscribe: null, // To store the unsubscribe function
      observer: null,    // Intersection Observer instance
      isSimulationActive: false, // Flag to track simulation state
      hasInitialized: false, // Flag to track if simulation has been initialized
    };
  },
  async mounted() {
    await this.fetchUserPreferences();
    nextTick(() => {
      this.setupIntersectionObserver();
    });

    // Initialize ResizeObserver (to handle container size changes when simulation is active)
    this.resizeObserver = new ResizeObserver(this.debouncedResize);
    if (this.$refs.matterContainer) {
      this.resizeObserver.observe(this.$refs.matterContainer);
    }

    // Set up Firestore listener for real-time updates
    this.unsubscribe = listenForUserPreferenceUpdates(this.handlePreferenceUpdate);
  },
  beforeUnmount() {
    // Disconnect Intersection Observer
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // Disconnect ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    // Unsubscribe from Firestore listener
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }

    // Cleanup Matter.js simulation if active
    if (this.isSimulationActive) {
      this.cleanup();
    }
  },
  methods: {
    async fetchUserPreferences() {
      this.userData = await getUserDataFromFirestore();
    },
    debouncedResize() {
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }

      this.resizeTimeout = setTimeout(() => {
        this.handleResize();
      }, 150);
    },
    handleResize() {
      const container = this.$refs.matterContainer;
      if (container && this.isSimulationActive) {
        const newWidth = container.clientWidth;
        const newHeight = container.clientHeight;
        this.canvasWidth = newWidth;
        this.canvasHeight = newHeight;

        if (this.render) {
          const pixelRatio = window.devicePixelRatio || 1;
          this.render.bounds.max.x = newWidth;
          this.render.bounds.max.y = newHeight;
          this.render.options.width = newWidth;
          this.render.options.height = newHeight;

          // Adjust the canvas size
          this.render.canvas.width = newWidth * pixelRatio;
          this.render.canvas.height = newHeight * pixelRatio;
          this.render.canvas.style.width = `${newWidth}px`;
          this.render.canvas.style.height = `${newHeight}px`;
          this.render.context.scale(pixelRatio, pixelRatio);

          // Update walls
          this.updateWalls(newWidth, newHeight);

          // Ensure pills are within the new boundaries
          this.ensurePillsWithinBounds(newWidth, newHeight);
        }
      }
    },
    measureText(text, fontSize = '16px Poppins') {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      context.font = fontSize;
      return context.measureText(text).width;
    },
    createPill(x, y, text, style) {
      const textWidth = this.measureText(text, `${style.fontWeight} 16px Poppins`);
      const width = Math.max(style.minWidth, textWidth + style.padding);
      const height = style.height;

      const pill = Matter.Bodies.rectangle(x, y, width, height, {
        chamfer: { radius: height / 2 },
        render: {
          fillStyle: style.color, // Filled with specified color
          strokeStyle: 'transparent', // No outline
          lineWidth: 0
        },
        restitution: 0.5, // Bounciness
        friction: 0.1,    // Smooth movement
      });

      pill.label = text;
      pill.textColor = style.textColor; // Set text color based on pill type
      pill.fontWeight = style.fontWeight; // Assign font weight
      return pill;
    },
    createInterestPills(interests, startX, startY, offsetY, columns, pillType) {
      const pills = [];
      const style = this.pillStyles[pillType];
      let currentX = startX;
      let currentY = startY;

      for (let i = 0; i < interests.length; i++) {
        const item = interests[i];
        const textWidth = this.measureText(item, `${style.fontWeight} 16px Poppins`);
        const pillWidth = Math.max(style.minWidth, textWidth + style.padding);
        const pillHeight = style.height;

        // Ensure pills stay within the container width
        if (currentX + pillWidth > this.canvasWidth - startX - this.wallThickness) {
          currentX = startX;
          currentY += offsetY;
        }

        // Prevent pills from being placed beyond the container height
        if (currentY + pillHeight / 2 > this.canvasHeight - this.wallThickness) {
          currentY = startY;
        }

        const pill = this.createPill(currentX + pillWidth / 2, currentY, item, style);
        pills.push(pill);
        currentX += pillWidth + 20; // 20px horizontal spacing between pills
      }

      return pills;
    },
    createWalls(width, height) {
      // Ground - bottom
      const ground = Matter.Bodies.rectangle(
        width / 2,
        height + this.wallThickness / 2,
        width + this.wallThickness * 2,
        this.wallThickness,
        {
          isStatic: true,
          render: { fillStyle: "transparent" }
        }
      );

      // Roof - top
      const roof = Matter.Bodies.rectangle(
        width / 2,
        -this.wallThickness / 2,
        width + this.wallThickness * 2,
        this.wallThickness,
        {
          isStatic: true,
          render: { fillStyle: "transparent" }
        }
      );

      // Left wall
      const leftWall = Matter.Bodies.rectangle(
        -this.wallThickness / 2,
        height / 2,
        this.wallThickness,
        height + this.wallThickness * 2,
        {
          isStatic: true,
          render: { fillStyle: "transparent" }
        }
      );

      // Right wall
      const rightWall = Matter.Bodies.rectangle(
        width + this.wallThickness / 2,
        height / 2,
        this.wallThickness,
        height + this.wallThickness * 2,
        {
          isStatic: true,
          render: { fillStyle: "transparent" }
        }
      );

      return [ground, roof, leftWall, rightWall];
    },
    updateWalls(width, height) {
      // Update ground position and size
      Matter.Body.setPosition(this.walls[0], {
        x: width / 2,
        y: height + this.wallThickness / 2
      });
      Matter.Body.setVertices(this.walls[0], Matter.Vertices.fromPath(
        `0 0 ${width + this.wallThickness * 2} 0 ${width + this.wallThickness * 2} ${this.wallThickness} 0 ${this.wallThickness}`
      ));

      // Update roof position and size
      Matter.Body.setPosition(this.walls[1], {
        x: width / 2,
        y: -this.wallThickness / 2
      });
      Matter.Body.setVertices(this.walls[1], Matter.Vertices.fromPath(
        `0 0 ${width + this.wallThickness * 2} 0 ${width + this.wallThickness * 2} ${this.wallThickness} 0 ${this.wallThickness}`
      ));

      // Update left wall position and size
      Matter.Body.setPosition(this.walls[2], {
        x: -this.wallThickness / 2,
        y: height / 2
      });
      Matter.Body.setVertices(this.walls[2], Matter.Vertices.fromPath(
        `0 0 ${this.wallThickness} 0 ${this.wallThickness} ${height + this.wallThickness * 2} 0 ${height + this.wallThickness * 2}`
      ));

      // Update right wall position and size
      Matter.Body.setPosition(this.walls[3], {
        x: width + this.wallThickness / 2,
        y: height / 2
      });
      Matter.Body.setVertices(this.walls[3], Matter.Vertices.fromPath(
        `0 0 ${this.wallThickness} 0 ${this.wallThickness} ${height + this.wallThickness * 2} 0 ${height + this.wallThickness * 2}`
      ));
    },
    initSimulation() {
      if (this.isSimulationActive) return; // Prevent multiple initializations
      this.isSimulationActive = true;

      const container = this.$refs.matterContainer;
      const width = container.clientWidth;
      const height = container.clientHeight;
      this.canvasWidth = width;
      this.canvasHeight = height;
      const pixelRatio = window.devicePixelRatio || 1;

      this.engine = Matter.Engine.create();
      this.engine.world.gravity.y = 0.8;
      this.engine.world.gravity.scale = 0.00025;

      this.render = Matter.Render.create({
        element: container,
        engine: this.engine,
        options: {
          width,
          height,
          pixelRatio,
          wireframes: false,
          background: 'transparent',
        },
      });

      // Create and add walls
      this.walls = this.createWalls(width, height);
      Matter.Composite.add(this.engine.world, this.walls);

      // Create pills
      this.setupSimulation(width, height);

      Matter.Render.run(this.render);
      this.runner = Matter.Runner.create();
      Matter.Runner.run(this.runner, this.engine);

      const mouse = Matter.Mouse.create(this.render.canvas);
      mouse.pixelRatio = pixelRatio;
      const mouseConstraint = Matter.MouseConstraint.create(this.engine, {
        mouse: mouse,
        constraint: {
          stiffness: 0.2,
          render: { visible: false }
        }
      });

      Matter.Composite.add(this.engine.world, mouseConstraint);
      this.render.mouse = mouse;

      Matter.Events.on(this.engine, 'beforeUpdate', this.limitVelocity);

      // Text rendering without glow and with filled shapes
      Matter.Events.on(this.render, 'afterRender', () => {
        const context = this.render.context;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.shadowBlur = 0; // Remove glow

        // Render Pills Text
        [...this.categoryPills, ...this.ccaPills].forEach((pill) => {
          context.save();
          context.translate(pill.position.x, pill.position.y);
          context.rotate(pill.angle);

          context.fillStyle = pill.textColor; // Set text color based on pill type

          context.font = `${pill.fontWeight} 16px Poppins`; // Apply dynamic font weight
          context.fillText(pill.label, 0, 0);
          context.restore();
        });
      });
    },
    setupSimulation(width, height) {
      const startX = this.wallThickness + 5; // Start after the left wall
      const startY = this.wallThickness + 5; // Start below the roof
      const offsetY = 80;
      const columns = Math.floor((width - 2 * this.wallThickness - 100) / 200) || 1;

      // Create Category Pills
      this.categoryPills = this.createInterestPills(
        this.userData?.category_interests || [],
        startX,
        startY,
        offsetY,
        columns,
        'category'
      );

      // Create CCA Pills
      const startCCA_Y = startY + (Math.ceil((this.userData?.category_interests?.length || 0) / columns) * offsetY) + 50; // Start below the Category pills and some padding
      this.ccaPills = this.createInterestPills(
        this.userData?.cca_interest || [],
        startX,
        startCCA_Y,
        offsetY,
        columns,
        'cca'
      );

      // Add pills to the world
      Matter.Composite.add(this.engine.world, [...this.categoryPills, ...this.ccaPills]);
    },
    ensurePillsWithinBounds(width, height) {
      const wallThickness = this.wallThickness;
      [...this.categoryPills, ...this.ccaPills].forEach((pill) => {
        let updated = false;
        let newX = pill.position.x;
        let newY = pill.position.y;

        // Calculate half dimensions
        const halfWidth = (pill.bounds.max.x - pill.bounds.min.x) / 2;
        const halfHeight = (pill.bounds.max.y - pill.bounds.min.y) / 2;

        // Check left and right boundaries
        if (newX - halfWidth < wallThickness) {
          newX = wallThickness + halfWidth;
          updated = true;
        } else if (newX + halfWidth > width - wallThickness) {
          newX = width - wallThickness - halfWidth;
          updated = true;
        }

        // Check top and bottom boundaries
        if (newY - halfHeight < wallThickness) {
          newY = wallThickness + halfHeight;
          updated = true;
        } else if (newY + halfHeight > height - wallThickness) {
          newY = height - wallThickness - halfHeight;
          updated = true;
        }

        if (updated) {
          Matter.Body.setPosition(pill, { x: newX, y: newY });
          Matter.Body.setVelocity(pill, { x: 0, y: 0 }); // Reset velocity to prevent sticking
        }
      });
    },
    limitVelocity() {
      const maxSpeed = 20;
      [...this.categoryPills, ...this.ccaPills].forEach((body) => {
        const vx = body.velocity.x;
        const vy = body.velocity.y;
        const speed = Math.sqrt(vx * vx + vy * vy);
        if (speed > maxSpeed) {
          const scale = maxSpeed / speed;
          Matter.Body.setVelocity(body, { x: vx * scale, y: vy * scale });
        }
      });
    },
    cleanup() {
      if (this.render) {
        Matter.Render.stop(this.render);
        Matter.Runner.stop(this.runner);
        Matter.Composite.clear(this.engine.world);
        Matter.Engine.clear(this.engine);

        if (this.render.canvas) {
          this.render.canvas.remove();
          this.render.canvas = null;
        }
        this.render.context = null;
        this.render.textures = {};
      }
      this.categoryPills = [];
      this.ccaPills = [];
      this.walls = [];
      this.engine = null;
      this.render = null;
      this.runner = null;

      // **Reset the simulation active flag**
      this.isSimulationActive = false;
    },
    /**
     * Callback to handle updates from Firestore listener
     * @param {Object} updatedData - The updated user data from Firestore
     */
    handlePreferenceUpdate(updatedData) {
      this.userData = updatedData;
      // Re-initialize the simulation with the updated data if active
      if (this.isSimulationActive) {
        this.cleanup();
        this.initSimulation();
      }
    },
    setupIntersectionObserver() {
      const options = {
        root: null, // Relative to the viewport
        rootMargin: '0px',
        threshold: 0.1 // Trigger when 10% of the element is visible
      };

      this.observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !this.hasInitialized) {
            this.hasInitialized = true; // Set the flag to prevent re-initialization
            this.initSimulation();
            this.observer.disconnect(); // Stop observing after initialization
          }
        });
      }, options);

      if (this.$refs.matterContainer) {
        this.observer.observe(this.$refs.matterContainer);
      }
    },
  },
};
</script>

<style scoped>
.container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.matter-container {
  width: 100%;
  max-height: 600px;
  height: 50vh;
  overflow: hidden;
  position: relative;
  background-color: #693EFE;
  cursor: grab;
}
</style>
