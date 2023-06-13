$(window).on("load", function () {
  const baseDir = window.location.pathname.substring(0, 43);
  

  function getAssetUrl(assetPath) {
    path = baseDir + assetPath
    console.log("🚀 ~ file: script.js:9 ~ getAssetUrl ~ assetPath:", assetPath)
    console.log("🚀 ~ file: script.js:10 ~ getAssetUrl ~ path:", path)
    console.log("🚀 ~ file: script.js:11 ~ getAssetUrl ~ baseDir:", baseDir)
    return path}
    console.log("🚀 ~ file: script.js:11 ~ getAssetUrl ~ baseDir:", baseDir)
    
  
  // INITALIZE GALLERY
  $(".gallery").flickity({
    cellAlign: "center",
    contain: true,
    wrapAround: true,
  });

  const blankWeather = getAssetUrl("/assets/images/backgrounds/blank.png");
  const sunnyClear = getAssetUrl("/assets/images/backgrounds/sunny-clear.png");
  const rainDrizzle = getAssetUrl("/assets/images/backgrounds/sunny-drizzle.png");
  const sunnyRain = getAssetUrl("/assets/images/backgrounds/sunny-rain.png");
  const cloudyClear = getAssetUrl("/assets/images/backgrounds/cloudy-clear.png");
  const snowy = getAssetUrl("/assets/images/backgrounds/snowy.png");
  const thunderStorm = getAssetUrl("/assets/images/backgrounds/thunder-storm.png");
  

  const weathers = {
    Blank: blankWeather,
    Clear: sunnyClear,
    Clouds: cloudyClear,
    Rain: sunnyRain,
    Snow: snowy,
    Drizzle: rainDrizzle,
    Thunderstorm: thunderStorm,
    Atmosphere: {
      Mist: sunnyClear,
      Smoke: sunnyClear,
      Haze: sunnyClear,
      Dust: sunnyClear,
      Fog: sunnyClear,
      Sand: sunnyClear,
      Ash: sunnyClear,
      Squall: sunnyRain,
      Tornado: cloudyClear,
    },
  };
  // console.log(weathers)
  var tForecasts = [];
  var latitude;
  var longitude;
  var oldWeather;
  var newWeather;
  var apiKey = "81fba63bc262d8384351efd1abd18569";
  var cityName = "Minneapolis";
  var cityCountry = "US"
  var previousData = "Clear";
  var currentData = "Clear";
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  function display5DayForecast(forecasts) {
    let forecastHeader = "<h2 id='forecast-header'>5 Day " + cityName + " Forecast</h2>";
    $("#forecast").html(forecastHeader)
    // Start with an empty string
    let html = "";
    
    // Loop through the forecasts array
    forecasts.forEach((forecast) => {
      // Format the date
      let formattedDate = dayjs(forecast.date).format("MMM D");
  
      // Generate the URL for the weather icon
      let iconUrl = `http://openweathermap.org/img/w/${forecast.icon}.png`;
      // Add a 'forecast-card' div to the html string
      html += `
        <div class="forecast-card" style="background-image: url('${forecast.weatherImage}')">
          <div class="forecast-date">${formattedDate}</div>
          <div class="forecast-temp">${forecast.avgTemp}°F</div>
          <div class="forecast-condition">${forecast.weatherCondition}</div>
          <div class="forecast-humidity">Humidity: ${forecast.humidity}%</div>
          <div class="forecast-wind">Wind Speed: ${forecast.windSpeed} m/s</div>
          <img src="${iconUrl}" alt="${forecast.weatherCondition}" class="weather-icon">
        </div>
      `;
    });
  
    // Add the html to the #forecast element
    $("#forecast").append(html);
  }
  
  function fetch5DayForecast(latitude, longitude) {
    // console.log("testing fetch5DayForecast");

    var apiForecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
    let aggregatedData = {};
    let tForecasts = [];

    fetch(apiForecastUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data) {
          data.list.forEach((forecast) => {
            let date = forecast.dt_txt.split(" ")[0];

            if (!aggregatedData[date]) {
              aggregatedData[date] = {
                temps: [forecast.main.temp],
                icons: [forecast.weather[0].icon],
                conditions: [forecast.weather[0].main],
                humidities: [forecast.main.humidity],
                windSpeeds: [forecast.wind.speed]
              };
            } else {
              aggregatedData[date].temps.push(forecast.main.temp);
              aggregatedData[date].icons.push(forecast.weather[0].icon);
              aggregatedData[date].conditions.push(forecast.weather[0].main);
              aggregatedData[date].humidities.push(forecast.main.humidity);
              aggregatedData[date].windSpeeds.push(forecast.wind.speed);
            }
          });

          for (let date in aggregatedData) {
            let temps = aggregatedData[date].temps;
            let icons = aggregatedData[date].icons;
            let conditions = aggregatedData[date].conditions;
            let humidities = aggregatedData[date].humidities;
            let windSpeeds = aggregatedData[date].windSpeeds;
            let avgTempK = temps.reduce((a, b) => a + b, 0) / temps.length;
            let avgTempF = Math.floor(((avgTempK - 273.15) * 9) / 5 + 32);

            // Find the most common weather condition and icon for the day
            let mostCommonCondition = mode(conditions);
            let mostCommonIcon = mode(icons);
            let avgHumidity = Math.round(humidities.reduce((a, b) => a + b, 0) / humidities.length);
            let avgWindSpeed = Math.round(windSpeeds.reduce((a, b) => a + b, 0) / windSpeeds.length * 10) / 10; // Round to 1 decimal place

            // Add the condition to the filename for the background image
            let weatherImage = weathers[mostCommonCondition];

            tForecasts.push({
              date: date,
              avgTemp: avgTempF,
              icon: mostCommonIcon,
              weatherCondition: mostCommonCondition,
              weatherImage: weatherImage,
              humidity: avgHumidity,
              windSpeed: avgWindSpeed,
            });
          }

          tForecasts = tForecasts.slice(0, 5);

          display5DayForecast(tForecasts);
        } else {
          console.log("No results found for the specified location.");
        }
      })
      .catch((error) => {
        console.log("API request failed. Error:", error);
      });
  } 


  // Helper function to find the most common element in an array
  function mode(array) {
    return array
      .sort(
        (a, b) =>
          array.filter((v) => v === a).length -
          array.filter((v) => v === b).length
      )
      .pop();
  }

  function determineWeather() {
    oldWeather = weathers[previousData];
    newWeather = weathers[currentData]
    changeWeather(oldWeather, newWeather);
  }
  // Create a function to change the weather background
  function changeWeather(startWeather, targetWeather) {
    // console.log("[Change Weather] Started.");
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
          // console.log(img.src);
          img.onload = function () {
            images[index] = img;
            // Increment the load count and check if all images have been loaded
            loadCount++;
            // If all images have been loaded, start the cloud animation and resolve the promise
            if (loadCount === imageSources.length) {
              // console.log(images); // Debugging line
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
        // console.log("Background fade and image loading complete");
        // console.log(cityName);
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
        "z-index": 0,
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
            // console.log("Animation stopped");
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

  // Function that creates an empty card
  function createEmptyCard() {
    var emptyGalleryCell = $("<div>Search a city to add</div>").addClass("gallery-cell empty-card");
    emptyGalleryCell.css({
      "background-size": "cover",
      "background-repeat": "no-repeat",
      "background-position": "center",
    });
    return emptyGalleryCell;
  }

  function addCityToGallery(cityWeather) {
    // console.log(cityWeather)
    // Check if the city already exists in the gallery
    var existingCity = $(".gallery-cell").filter(function () { return $(this).text().trim().split("").filter(char => /^[a-zA-Z]+(-[a-zA-Z]+)*$/.test(char)) === cityWeather.city; });

    // City already exists, do not add it again
    if (existingCity.length > 0) { return; }

    var galleryCell = $("<div>").addClass("gallery-cell");
    galleryCell.css({
      "background-image": `url(${cityWeather.weatherImage})`,
      "background-size": "cover",
      "background-repeat": "no-repeat",
      "background-position": "center",
    });
    galleryCell.on("click", function () {
      // Check if the clicked card is an empty card
      // It's an empty card, ignore the click event
      if ($(this).hasClass("empty-card")) { return; }

      // Set the clicked city as the current city
      $(".city-name").addClass("current-city");
      $(".city-name").not(cityName).removeClass("current-city");

      // Update currentCity and fetch weather data for the selected city
      cityName = cityWeather.city;
      weatherFetch();
    });
    var cityDiv = $("<div>").addClass("city-name").text(`${cityWeather.city}, ${cityWeather.country}`);
    galleryCell.append(cityDiv);

    var weatherCondition = $("<div>").addClass("weather-condition").text(cityWeather.weatherCondition);
    galleryCell.append(weatherCondition);

    var emptyCard = $(".empty-card").first();
    if (emptyCard.length > 0) {
      // Replace the first empty card with the new card
      emptyCard.replaceWith(galleryCell);
    } else {
      // Append the new card to the gallery
      $(".gallery").append(galleryCell);
    }

    // Check if the total number of cards is less than the minimum
    var minCards = 7; // Set the minimum number of cards
    var totalCards = $(".gallery-cell").length;
    while (totalCards < minCards) {
      // Add empty cards until the minimum is reached
      $(".gallery").append(createEmptyCard());
      totalCards++;
    }

    // Reinitialize Flickity carousel
    $(".gallery").flickity("destroy");
    $(".gallery").flickity({
      cellAlign: "center",
      wrapAround: true,
      draggable: false,
    });
  }
  // Get the user's current position
  navigator.geolocation.getCurrentPosition(function (position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;

    // Use the latitude and longitude to fetch weather
    fetchWeatherByLocation(latitude, longitude);
  });


  // Construct the API URL

  function weatherFetch() {
    var apiLocationUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${apiKey}`;

    // Make the API request
    fetch(apiLocationUrl)
      .then((response) => response.json())
      .then((data) => {
        // Handle the API response
        if (data.length > 0) {
          var latitude = data[0].lat;
          var longitude = data[0].lon;

          fetch5DayForecast(latitude, longitude);
          //console.log("tempforecasts: ", tForecasts);
          var apiWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;

          // Make the API request
          fetch(apiWeatherUrl)
            .then((response) => response.json())
            .then((data) => {
              // console.log(data)
              // Handle the API response
              if (data) {
                let condition = data.weather[0].main;
                let curHumidity = data.main.humidity
                previousData = currentData;
                currentData = condition;
                determineWeather();
                let imageFileName;
                if (weathers[condition]) {
                  imageFileName = weathers[condition];
                } else if (weathers["Atmosphere"][condition]) {
                  imageFileName = weathers["Atmosphere"][condition];
                }

                if (imageFileName) {
                  const cityWeather = {
                    city: cityName,
                    country: data.sys.country,
                    weatherCondition: condition,
                    weatherImage: imageFileName,
                  };

                  // Check if city already exists in the stored cities array
                  const cityExists = storedCities.some(
                    (storedCity) =>
                      storedCity.city.toLowerCase() === cityName.toLowerCase()
                  );

                  if (!cityExists) {
                    // Save to localStorage
                    storedCities.push(cityWeather);
                    localStorage.setItem(
                      "cities",
                      JSON.stringify(storedCities)
                    );

                    // Add to gallery
                    addCityToGallery(cityWeather);
                  }
                  fDegree = Math.floor(
                    ((data.main.temp - 273.15) * 9) / 5 + 32
                  );
                  // console.log(fDegree);
                  $("#info-display").html(
                    `
                  <div class="info">City: ${cityName}</div>
                  <div class="info">Condition: ${condition}</div>
                  <div class="info">Temperature: ${fDegree}°F</div>
                  <div class="info">Humidity: ${curHumidity}%</div>`
                  );
                } else {
                  console.log(
                    "No image file name found for the condition:",
                    condition
                  );
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
      toSearch = capitalizeFirstLetter(toSearch).split("").filter((char) => (/^[a-zA-Z ]*$/).test(char)).join("");
      cityName = toSearch;
      try {
        // console.log("cityname: ", cityName);
        weatherFetch()
      } catch (error) {
        console.log(error);
        console.log("No city found!");
      }
    }
  });

  // Load previously searched cities from localStorage
  var storedCities = JSON.parse(localStorage.getItem("cities")) || [];
  storedCities.forEach((cityWeather) => {
    addCityToGallery(cityWeather);
  });

  setTimeout(() => {
    cityName = "Minneapolis";
    weatherFetch();
  }, 200);
});
