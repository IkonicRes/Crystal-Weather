//Our snippet function to get the correct path to assets on deployment, initialize the base directory as
//the pretext to our relative path
const baseDir = window.location.origin + window.location.pathname

// Helper Functions
// Call this function any time you need to get the path and pass in relative path as the argument
function getAssetUrl(assetPath) { return baseDir + assetPath }

// Helper function for capitalizing the first letter of a string
function capitalizeFirstLetter(string) { return string.charAt(0).toUpperCase() + string.slice(1); }

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

//Wait until the window loads to fire the rest of the code
$(window).on("load", function () {
    // Get the canvas used for the weather changing animation
    const canvas = $("#canvas")[0];
    ctx = canvas.getContext("2d");

    // Initialize the flickity js gallery
    $(".gallery").flickity({
      cellAlign: "center",
      contain: true,
      wrapAround: true,
    });

    // Create an object containing the different weather types
    const weathers = {
      Blank: getAssetUrl("assets/images/backgrounds/blank.png"),
      Clear: getAssetUrl("assets/images/backgrounds/sunny-clear.png"),
      Clouds: getAssetUrl("assets/images/backgrounds/cloudy-clear.png"),
      Rain: getAssetUrl("assets/images/backgrounds/sunny-rain.png"),
      Snow: getAssetUrl("assets/images/backgrounds/snowy.png"),
      Drizzle: getAssetUrl("assets/images/backgrounds/sunny-showers.png"),
      Thunderstorm: getAssetUrl("assets/images/backgrounds/thunder-storm.png"),
      Atmosphere: {
        Mist: getAssetUrl("assets/images/backgrounds/misty.png"),
        Smoke: getAssetUrl("assets/images/backgrounds/smoky.png"),
        Haze: getAssetUrl("assets/images/backgrounds/hazy.png"),
        Dust: getAssetUrl("assets/images/backgrounds/dusty.png"),
        Fog: getAssetUrl("assets/images/backgrounds/foggy.png"),
        Sand: getAssetUrl("assets/images/backgrounds/sandy.png"),
        Ash: getAssetUrl("assets/images/backgrounds/ashy.png"),
        Squall: getAssetUrl("assets/images/backgrounds/squall.png"),
        Tornado: getAssetUrl("assets/images/backgrounds/tornado.png"),
      },
    };

    // Initializing variables for later use.
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

    // Generate the HTML to display the 5 day forecast
    function display5DayForecast(forecasts) {
      let forecastHeader = "<h2 id='forecast-header'>5 Day " + cityName + " Forecast</h2>";
      $("#forecast").html(forecastHeader)
      // Initialize an empty string that will store the HTML of the forecast cards.
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
      // Add the string of HTML to the #forecast element
      $("#forecast").append(html);
    }
    
    // Fetch the data for the 5 day forecast
    function fetch5DayForecast(latitude, longitude) {
      // Initialize variables and the fetch url
      var apiForecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;
      let aggregatedData = {};
      let tForecasts = [];

      // Run the fetch request to the URL
      fetch(apiForecastUrl)
        .then((response) => response.json())
        .then((data) => {
          if (data) {
            data.list.forEach((forecast) => {
              let date = forecast.dt_txt.split(" ")[0];
              // If the date is not found, add a new entry to the array with the data object.
              // If the date is found, add the data object entries to their corrosponding array.
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

            // Find the average of the data.
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
              
              // Add the data to the forecast array
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
            // Cut the forecast array to ensure only 5 entries.
            tForecasts = tForecasts.slice(0, 5);
            display5DayForecast(tForecasts);
          } else { console.log("No results found for the specified location."); }
        })
        .catch((error) => { console.log("API request failed. Error:", error); });
    } 

  // Create a function to change the weather background
  function changeWeather(startWeather, targetWeather) {
    startWeather = weathers[startWeather];
    targetWeather = weathers[targetWeather];
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
      getAssetUrl("assets/images/animation/cloud1.png"),
      getAssetUrl("assets/images/animation/cloud2.png"),
      getAssetUrl("assets/images/animation/cloud3.png"),
      getAssetUrl("assets/images/animation/cloud4.png"),
      getAssetUrl("assets/images/animation/cloud5.png"),
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
          img.src = source;
          img.onload = function () {
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
      if (!animationRunning) { return; }
      // Clear the canvas before drawing the next frame
      ctx.clearRect(0, 0, canvas[0].width, canvas[0].height);
      // Update the cloud opacity and limit it to 1
      cloudOpacity += 0.01;
      // Set the global alpha for transparencY
      if (cloudOpacity > 1) { cloudOpacity = 1; }
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
    // Set animationRunning to false
    function stopAnimation() { animationRunning = false; }
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


  function getWeatherType(weatherType) {
    if (weathers[weatherType]) {
    return weathers[weatherType]
    } else if (weathers.Atmosphere[weatherType]) {
    return weathers.Atmosphere[weatherType]
    } else { console.error("could not find weather type")
    }
  }
  // navigator.geolocation.getCurrentPosition(function (position) {
  //   var latitude = position.coords.latitude;
  //   var longitude = position.coords.longitude;

  //   // Use the latitude and longitude to fetch weather
  //   weatherFetch(currentCity)
  // });
//

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
          var apiWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}`;

          // Make the API request
          fetch(apiWeatherUrl)
            .then((response) => response.json())
            .then((data) => {
              // Handle the API response
              console.log(data)
              if (data) {
                let condition = data.weather[0].main;
                let iconUrl = `http://openweathermap.org/img/w/${data.weather[0].icon}.png`;
                console.log(condition)
                previousData = currentData;
                currentData = condition;
                changeWeather(previousData, currentData);
                let imageFileName = getWeatherType(condition)

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
                  fDegree = Math.floor(((data.main.temp - 273.15) * 9) / 5 + 32);
                  $("#info-display").html(
                    `
                    <img src="${iconUrl}" alt="${data.weather[0].main}" class="weather-icon-main"></div>
                    <div class="info">${dayjs(data.date).format("MMM D")}</div>
                  <div class="info">City: ${cityName}</div>
                  <div class="info">Condition: ${condition}</div>
                  <div class="info">Temperature: ${fDegree}°F</div>
                  <div class="info">Humidity: ${data.main.humidity}%</div>
                  <div class="info">Wind Speed: ${data.wind.speed}m/s</div>`
                  );
                } else { console.error(`No image file name found for the condition: ${condition}`); }
              } else { console.log("No results found for the specified location."); }
            })
            .catch((error) => { console.error(`API request failed. Error:${error}`); });
        } else { console.warn("No results found for the specified city."); }
      })
      .catch((error) => { console.error("API request failed. Error:", error); });
  }
// When the user presses "enter" on the search bar, get the value on the search bar, capitalize the first letter, and set the "cityName variable" to it
  $("#search-bar").keypress(function (event) {
    var keycode = event.keyCode ? event.keyCode : event.which;
    if (keycode === 13) {
      var toSearch = $(this).val();
      toSearch = capitalizeFirstLetter(toSearch).split("").filter((char) => (/^[a-zA-Z ]*$/).test(char)).join("");
      cityName = toSearch;
      try {
        weatherFetch()
      } catch (error) {
        console.error(error);
        console.error("No city found!");
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
