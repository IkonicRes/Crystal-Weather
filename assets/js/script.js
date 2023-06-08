// This code initializes the changeWeather function, which is intended to be called whenever the weather changes in order to play the cloud animation.
function changeWeather() {
    // First, we initialize an empty array to store the cloud images.
    let images = []
    // Next, we get the image source paths from our project.
    let imageSources = [
      '../assets/images/cloud1.png',
      '../assets/images/cloud2.png',
      '../assets/images/cloud3.png',
      '../assets/images/cloud4.png',
      '../assets/images/cloud5.png'
    ]
    // We create a counter variable to keep track of the number of loaded images.
    let loadCount = 0;
    // And iterate over each image source and create an Image object for each.
    imageSources.forEach((source, index) => {
        let img = new Image();
        img.src = source;
        // Once an image is loaded, we increment the counter and check if all images have been loaded.
        img.onload = function() {
          images[index] = img;
          loadCount++;
          if (loadCount === imageSources.length) {
            // If all images have been loaded, we start the cloud animation.
            startAnimation();
          }
        };
      });
      // We retrieve the canvas element using jQuery and get its 2D rendering context.
    let canvas = $('#canvas')[0];
    let ctx = canvas.getContext('2d');
    // Then we define an array of cloud layers, each with an image index and speed.
    let cloudLayers = [
    { imageIndex: 0, speed: 1 },
    { imageIndex: 1, speed: 0.82 },
    { imageIndex: 2, speed: 0.68 },
    { imageIndex: 3, speed: 0.63 },
    { imageIndex: 4, speed: 0.43 }
    ];
    // This function animates the clouds by clearing the canvas, updating the cloud positions, and drawing the current cloud image.
    function animate() {
    // Clear the canvas for the new frame
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    cloudLayers.forEach(layer => {
        // Calculate the cloud's x position based on its speed
        layer.xPos += layer.speed;

        // Wrap the cloud back to the left side of the canvas when it goes off-screen
        if (layer.xPos > canvas.width) {
        layer.xPos = -canvas.width;
        }

        // Draw the current cloud image at its position
        ctx.drawImage(
        images[layer.imageIndex],
        layer.xPos,
        0,
        canvas.width * 1.5,
        canvas.height * 1.5
        );
    });

    // Request the next frame
    window.requestAnimationFrame(animate);
    }

    function startAnimation() {
    // Initialize the x position for each cloud layer
    cloudLayers.forEach(layer => {
        layer.xPos = 0;
    });

    // Start the animation
    window.requestAnimationFrame(animate);
    }

    // Call the changeWeather function to start the cloud animation
    startAnimation();
}
changeWeather()