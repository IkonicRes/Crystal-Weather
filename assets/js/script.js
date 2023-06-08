const sunnyClear = '../images/backgrounds/sunny-clear.png';
const sunnyShowers = '../images/backgrounds/sunny-showers.png';
// Create a function to change the weather background
function changeWeather(startWeather, targetWeather) {
// Create a temporary background element with the startWeather image
  const tempBackground = $('<div>').css({
    // Set the CSS properties for the temporary background
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `url(${startWeather}) no-repeat center center fixed`,
    'background-size': 'cover',
    'z-index': -1
  // Append the temporary background to the body and hide it
  }).appendTo('body').hide();
  // Define the image sources for the cloud animation
  const imageSources = [
    '../images/animation/cloud1.png',
    '../images/animation/cloud2.png',
    '../images/animation/cloud3.png',
    '../images/animation/cloud4.png',
    '../images/animation/cloud5.png'
  ];
  // Create an array to store the loaded cloud images
  const images = [];
  // Initialize a counter for the loaded images
  let loadCount = 0;
  // Create a fadePromise using a Promise to handle the background fade
  const fadePromise = new Promise((resolve, reject) => {
    // Fade in the temporary background
    tempBackground.fadeIn(400, function() {
    // Set the target weather image as the background of the body 
      $('body').css('background-image', `url(${targetWeather})`);
    // Load the cloud images and store them in the images array 
      imageSources.forEach((source, index) => {
        const img = new Image();
        img.src = source;
        img.onload = function() {
          images[index] = img;
          // Increment the load count and check if all images have been loaded
          loadCount++;
          // If all images have been loaded, start the cloud animation and resolve the promise
          if (loadCount === imageSources.length) {
            startAnimation();
            resolve();
          }
        };
      });
      // Fade out the temporary background and call fadeOutClouds when complete
      tempBackground.fadeOut(1000, fadeOutClouds);
    });
  });
  // Use Promise.all to wait for the fadePromise to complete
  Promise.all([fadePromise])
    .then(() => {
      // Log a message when the background fade and image loading are complete
      console.log('Background fade and image loading complete');
    })
    .catch(error => {
      // Log an error if there was an error during the promise chain
      console.error(error);
    });
  // Create a canvas element and set its CSS properties
  const canvas = $('<canvas id="canvas"></canvas>').css({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    'z-index': -1
  // Append the canvas to the body
  }).appendTo('body');
  // Get the 2D rendering context of the canvas
  const ctx = canvas[0].getContext('2d');
  // Define the cloud layers with their image index and speed
  const cloudLayers = [
    { imageIndex: 0, speed: 1 },
    { imageIndex: 1, speed: 0.82 },
    { imageIndex: 2, speed: 0.68 },
    { imageIndex: 3, speed: 0.63 },
    { imageIndex: 4, speed: 0.43 }
  ];
  // Initialize variables for animation control
  let animationRunning = true;
  // Define the animate function to update and draw the cloud animation
  let cloudOpacity = 0;
  // Check if animation is running and return if not
  function animate() {
    if (!animationRunning) {
      return;
    }
    // Clear the canvas before drawing the next frame
    ctx.clearRect(0, 0, canvas[0].width, canvas[0].height);
    // Update the cloud opacity and limit it to 1
    cloudOpacity += 0.01;
    // Set the global alpha for transparencY
    if (cloudOpacity > 1) {
      cloudOpacity = 1;
    }
    // Update the position of each cloud layer and wrap around if necessary
    ctx.globalAlpha = cloudOpacity;
    // Draw each cloud layer on the canvas
    cloudLayers.forEach(layer => {
      layer.xPos += layer.speed;

      if (layer.xPos > canvas[0].width) {
        layer.xPos = -canvas[0].width;
      }

      ctx.drawImage(
        images[layer.imageIndex],
        layer.xPos,
        0,
        canvas[0].width * 1.5,
        canvas[0].height * 1.5
      );
    });

    window.requestAnimationFrame(animate);
  }
  // Define the startAnimation function to start the cloud animation
  function startAnimation() {
    // Set animationRunning to true and reset the cloud opacity
    animationRunning = true;
    cloudOpacity = 0;
    // Reset the position of each cloud layer
    cloudLayers.forEach(layer => {
      layer.xPos = 0;
    });
    // Request the first animation frame
    window.requestAnimationFrame(animate);
  }
  // Define the stopAnimation function to stop the cloud animation
  function stopAnimation() {
    // Set animationRunning to false
    animationRunning = false;
  }
  // Define the fadeOutClouds function to fade out the clouds and stop the animation
  function fadeOutClouds() {
    // Initialize the opacity for fading out
    let opacity = 1;
    // Set an interval to gradually decrease the opacity
    const fadeInterval = setInterval(function() {
      opacity -= 0.01;
      // When opacity reaches 0, clear the interval, stop the animation, fade out the canvas, and remove it
      if (opacity <= 0) {
        clearInterval(fadeInterval);
        stopAnimation();
        $(canvas).fadeOut(1000, function() {
          $(this).remove();
          // Log a message indicating that the animation has stopped
          console.log("Animation stopped");
        });
      } else {
        ctx.clearRect(0, 0, canvas[0].width, canvas[0].height);
        ctx.globalAlpha = opacity;

        cloudLayers.forEach(layer => {
          ctx.drawImage(
            images[layer.imageIndex],
            layer.xPos,
            0,
            canvas[0].width * 1.5,
            canvas[0].height * 1.5
          );
        });
      }
    }, 20);
  }
}
//DEBUG: Call the changeWeather function with the startWeather and targetWeather as arguments
changeWeather(sunnyClear, sunnyShowers);


// var apiKey = '81fba63bc262d8384351efd1abd18569';
// var cityName = 'Minneapolis';

// // Construct the API URL
// var apiUrl = 'http://api.openweathermap.org/geo/1.0/direct?q=' + cityName + '&limit=1&appid=' + apiKey;

// // Make the API request
// fetch(apiUrl)
// .then(response => response.json())
// .then(data => {
// // Handle the API response
// if (data.length > 0) {
// var latitude = data[0].lat;
// var longitude = data[0].lon;
// console.log('Latitude:', latitude);
// console.log('Longitude:', longitude);
// } else {
// console.log('No results found for the specified city.');
// }
// })
// .catch(error => {
// console.log('API request failed. Error:', error);
// });