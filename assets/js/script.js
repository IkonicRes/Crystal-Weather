$(window).on("load", function() {
  const baseDir = window.location.pathname.substring(
    0,
    window.location.pathname.lastIndexOf("/")
  );

  function getAssetUrl(assetPath) {
    console.log(baseDir);
    console.log(baseDir + assetPath);
    return baseDir + assetPath;
  }

  const blankWeather = getAssetUrl("/assets/images/backgrounds/blank.png");
  const sunnyClear = getAssetUrl("/assets/images/backgrounds/sunny-clear.png");
  const rainDrizzle = getAssetUrl(
    "/assets/images/backgrounds/sunny-drizzle.png"
  );
  const sunnyRain = getAssetUrl("/assets/images/backgrounds/sunny-rain.png");
  const cloudyClear = getAssetUrl(
    "/assets/images/backgrounds/cloudy-clear.png"
  );
  const snowy = getAssetUrl("/assets/images/backgrounds/snowy.png");
  const thunderStorm = getAssetUrl(
    "/assets/images/backgrounds/thunder-storm.png"
  );
  thunderStorm2 = "";

  const weathers = {
    Clear: sunnyClear,
    Clouds: cloudyClear,
    Rain: sunnyRain,
    Snow: snowy,
    Drizzle: rainDrizzle,
    Thunderstorm: thunderStorm,
    Atmosphere: {
      Mist:sunnyClear,
      Smoke:sunnyClear,
      Haze:sunnyClear,
      Dust:sunnyClear,
      Fog:sunnyClear,
      Sand:sunnyClear,
      Ash:sunnyClear,
      Squall:sunnyClear,
      Tornado:sunnyClear,
    }
  };

  var latitude;
  var longitude;
  var previousData = {};
  var currentData = {};
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}
  function fetch5DayForecast(latitude, longitude) {
    var apiForecastUrl =
      "https://api.openweathermap.org/data/2.5/forecast?lat=" +
      latitude +
      "&lon=" +
      longitude +
      "&appid=" +
      apiKey;
  
    // Make the API request
    fetch(apiForecastUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          console.log("5-day forecast:", data.list);
          // Process the 5-day forecast data here
  
          // Create an empty object to store the aggregated data
          let aggregatedData = {};
  
          data.list.forEach((forecast) => {
            // Extract the date from the dt_txt field
            let date = forecast.dt_txt.split(' ')[0];
  
            // If this date isn't in the aggregatedData object yet, add it with the current forecast's data
            if (!aggregatedData[date]) {
              aggregatedData[date] = [forecast];
            } 
            // If this date is already in the aggregatedData object, push the current forecast's data to it
            else {
              aggregatedData[date].push(forecast);
            }
          });
          // You can process these to find the average temperature, humidity, etc. for each day
          console.log("Aggregated data:", aggregatedData);
          // for now, return a Promise that resolves to an empty object after 1 second
          return aggregatedData

        } 
        else {
          console.log("No results found for the specified location.");
        }
      })
      .catch((error) => {
        console.log("API request failed. Error:", error);
      });
  }

  function determineWeather() {
    if (previousData === {}) {
      let oldWeather = previousData.weather[0].main;
      oldWeather = weathers[oldWeather];
    } else {
      oldWeather = blankWeather;
    }
    let newWeather = currentData.weather[0].main;
    newWeather = weathers[newWeather];
    console.log(newWeather);
    changeWeather(oldWeather, newWeather);
  }
  // Create a function to change the weather background
  function changeWeather(startWeather, targetWeather) {
    startWeather = baseDir + startWeather;
    targetWeather = baseDir + targetWeather;
    // Create a temporary background element with the startWeather image
    const tempBackground = $("<div>")
      .css({
        // Set the CSS properties for the temporary background
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: `url(${startWeather})`,
        "background-size": "cover",
        "z-index": -1,
        "background-repeat": "no-repeat",
        // Append the temporary background to the body and hide it
      })
      .appendTo("body")
      .hide();
    // Define the image sources for the cloud animation
    const imageSources = [
      getAssetUrl("/assets/images/animation/cloud1.png"),
      getAssetUrl("/assets/images/animation/cloud2.png"),
      getAssetUrl("/assets/images/animation/cloud3.png"),
      getAssetUrl("/assets/images/animation/cloud4.png"),
      getAssetUrl("/assets/images/animation/cloud5.png"),
    ];
    // Create an array to store the loaded cloud images
    const images = [];
    // Initialize a counter for the loaded images
    let loadCount = 0;
    // Create a fadePromise using a Promise to handle the background fade
    const fadePromise = new Promise((resolve, reject) => {
      // Fade in the temporary background
      tempBackground.fadeIn(400, function () {
        // Set the target weather image as the background of the body
        $("body").css({
          "background-image": `url(${targetWeather})`,
          "background-size": "cover",
          "z-index": -1,
          "background-repeat": "no-repeat",
        });

        // Load the cloud images and store them in the images array
        imageSources.forEach((source, index) => {
          const img = new Image();

          img.src = baseDir + source;
          console.log(img.src);
          img.onload = function () {
            images[index] = img;
            // Increment the load count and check if all images have been loaded
            loadCount++;
            // If all images have been loaded, start the cloud animation and resolve the promise
            if (loadCount === imageSources.length) {
              console.log(images); // Debugging line
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
        console.log("Background fade and image loading complete");
        console.log(cityName);
      })
      .catch((error) => {
        // Log an error if there was an error during the promise chain
        console.error(error);
      });
    // Create a canvas element and set its CSS properties
    const canvas = $('<canvas id="canvas"></canvas>')
      .css({
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        "z-index": -1,
        // Append the canvas to the body
      })
      .appendTo("body");
    // Get the 2D rendering context of the canvas
    const ctx = canvas[0].getContext("2d");
    // Define the cloud layers with their image index and speed
    const cloudLayers = [
      { imageIndex: 0, speed: 1 },
      { imageIndex: 1, speed: 0.82 },
      { imageIndex: 2, speed: 0.68 },
      { imageIndex: 3, speed: 0.63 },
      { imageIndex: 4, speed: 0.43 },
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
      cloudLayers.forEach((layer) => {
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
      cloudLayers.forEach((layer) => {
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
      const fadeInterval = setInterval(function () {
        opacity -= 0.01;
        // When opacity reaches 0, clear the interval, stop the animation, fade out the canvas, and remove it
        if (opacity <= 0) {
          clearInterval(fadeInterval);
          stopAnimation();
          $(canvas).fadeOut(1000, function () {
            $(this).remove();
            // Log a message indicating that the animation has stopped
            console.log("Animation stopped");
          });
        } else {
          ctx.clearRect(0, 0, canvas[0].width, canvas[0].height);
          ctx.globalAlpha = opacity;

          cloudLayers.forEach((layer) => {
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

  function addCityToGallery(cityWeather) {
    // Check if the city already exists in the gallery
    var existingCity = $(".gallery-cell").filter(function () {
      return $(this).text().trim() === cityWeather.city;
    });

    if (existingCity.length > 0) {
      // City already exists, do not add it again
      return;
    }

    var galleryCell = $("<div>").addClass("gallery-cell");
    galleryCell.css({
      "background-image": `url(${cityWeather.weatherImage})`,
      "background-size": "cover",
      "background-repeat": "no-repeat",
      "background-position": "center",
    });

    var cityName = $("<div>").addClass("city-name").text(cityWeather.city);
    galleryCell.append(cityName);

    var weatherCondition = $("<div>")
      .addClass("weather-condition")
      .text(cityWeather.weatherCondition);
    galleryCell.append(weatherCondition);

    galleryCell.on("click", function () {
      // Handle click event, set the clicked city as the current city
      cityName.addClass("current-city");
      $(".city-name").not(cityName).removeClass("current-city");
    });

    $(".gallery").append(galleryCell);

    // Reinitialize Flickity carousel
    $(".gallery").flickity("destroy");
    $(".gallery").flickity({
      wrapAround: true,
    });
  }

  var apiKey = "81fba63bc262d8384351efd1abd18569";
  var cityName = "Minneapolis";

  // Construct the API URL

  function weatherFetch() {
    var apiLocationUrl =
      "https://api.openweathermap.org/geo/1.0/direct?q=" +
      cityName +
      "&limit=1&appid=" +
      apiKey;

    // Make the API request
    fetch(apiLocationUrl)
      .then((response) => response.json())
      .then((data) => {
        console.log("API Location Response:", data);
        // Handle the API response
        if (data.length > 0) {
          var latitude = data[0].lat;
          var longitude = data[0].lon;
          console.log("Latitude:", latitude);
          console.log("Longitude:", longitude);

          fetch5DayForecast(latitude, longitude);

          var apiWeatherUrl =
            "https://api.openweathermap.org/data/2.5/weather?lat=" +
            latitude +
            "&lon=" +
            longitude +
            "&appid=" +
            apiKey;

          // Make the API request
          fetch(apiWeatherUrl)
            .then((response) => response.json())
            .then((data) => {
              console.log("API Weather Response:", data);
              // Handle the API response
              if (data) {
                console.log("description", data)
                let condition = data.weather[0].main;
                
                let imageFileName;
                if (weathers[condition]) {
                  imageFileName = weathers[condition];
                } else if (weathers['Atmosphere'][condition]) {
                  imageFileName = weathers['Atmosphere'][condition];
                }
  
                if (imageFileName) {
                  const cityWeather = {
                    city: cityName,
                    weatherCondition: condition,
                    weatherImage: imageFileName,
                  };
  
                  // Check if city already exists in the stored cities array
                  const cityExists = storedCities.some(storedCity => storedCity.city.toLowerCase() === cityName.toLowerCase());
  
                  if (!cityExists) {
                    // Save to localStorage
                    storedCities.push(cityWeather);
                    localStorage.setItem("cities", JSON.stringify(storedCities));
  
                    // Add to gallery
                    addCityToGallery(cityWeather);
                  }
                  fDegree = Math.floor((data.main.temp - 273.15) * 9/5 + 32)
                  console.log(fDegree)
                  $('#info-display').html(`
                  <div class="info">City: ${cityName}</div>
                  <div class="info">Condition: ${condition}</div>
                  <div class="info">Temperature: ` + fDegree + `°F</div>
                `);
                  
  
                } else {
                  console.log('No image file name found for the condition:', condition);
                }
  
              } else {
                console.log("No results found for the specified location.");
              }
            })
            .catch((error) => {
              console.log("API request failed. Error:", error);
            });
        } else {
          console.log("No results found for the specified city.");
        }
      })
      .catch((error) => {
        console.log("API request failed. Error:", error);
      });
  }

  $("#search-bar").keypress(function (event) {
    var keycode = event.keyCode ? event.keyCode : event.which;
    if (keycode === 13) {
      var toSearch = $(this).val();
      toSearch = capitalizeFirstLetter(toSearch)
      cityName = toSearch;
      try {
        weatherFetch();
        console.log("working!")
      } catch (error) {
        console.log("No city found!");
      }
    }
  });

  // Get the reference to the search element using jQuery
  const search = $("#search");
  // Set the background image dynamically using the getAssetUrl() function
  search.css("background-image", `url("${getAssetUrl("/assets/images/icons/search.png")}")`);
  // Get the reference to the image element
  // Get the reference to the image element using jQuery
  const $image = $("#crystal-ball");

  // Set the src attribute dynamically using the getAssetUrl() function
  $image.attr("src", getAssetUrl("/assets/images/icons/CrystalBall.png"));

  // Load previously searched cities from localStorage
  var storedCities = JSON.parse(localStorage.getItem("cities")) || [];
  storedCities.forEach((cityWeather) => {
    addCityToGallery(cityWeather);
  });

  // Reinitialize Flickity carousel
  $(".gallery").flickity("destroy");
  $(".gallery").flickity({
    wrapAround: true,
  });
  setTimeout(() => {
    cityName = "Miami"
    weatherFetch();
  }, 300);
  setTimeout(() => {
    cityName = "Seattle"
    weatherFetch();
  }, 350);
  setTimeout(() => {
    cityName = "Los Angeles"
    weatherFetch();
  }, 400);
  setTimeout(() => {
    cityName = "Chicago"
    weatherFetch();
  }, 450);
  setTimeout(() => {
    cityName = "New York"
    weatherFetch();
  }, 500);
  setTimeout(() => {
    cityName = "Honolulu"
    weatherFetch();
  }, 550);
  setTimeout(() => {
    cityName = "Minneapolis"
    weatherFetch();
  }, 600);
  }
)

