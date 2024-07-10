document.addEventListener('DOMContentLoaded', function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        document.getElementById('weatherInfo').innerHTML = `<p>Geolocation API'si bu tarayıcıda desteklenmiyor.</p>`;
    }

    document.getElementById('getLocationBtn').addEventListener('click', function () {
        requestLocation();
    });
});

function requestLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        document.getElementById('weatherInfo').innerHTML = `<p>Geolocation API'si bu tarayıcıda desteklenmiyor.</p>`;
    }
}

function showPosition(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const apiKey = '68d268ed68e547118df194755240707'; // Buraya kendi API anahtarınızı ekleyin

    // API URL'sini kontrol edin
    const apiUrl = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${latitude},${longitude}&days=7&lang=tr`;
    console.log(`Fetching data from: ${apiUrl}`);

    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                document.getElementById('weatherInfo').innerHTML = `<p>Hata: ${data.error.message}</p>`;
            } else {
                const location = data.location;
                const current = data.current;
                const forecast = data.forecast.forecastday;

                document.getElementById('location').textContent = `${location.name}, ${location.region}`;

                document.getElementById('currentWeather').innerHTML = `
                    <h3>Current Weather</h3>
                    <b id="current-temp-c">${current.temp_c}°C</b> 
                    <p id="current-weather-info">${current.condition.text}</p>
                    <p>Nem: ${current.humidity}%</p>
                    <p>Rüzgar: ${current.wind_kph} km/h</p>
                    <img src="${current.condition.icon}" alt="Hava durumu ikonu">
                `;

                let forecastHTML = '<h3>7 Günlük Tahmin</h3>';
                forecast.forEach(day => {
                    forecastHTML += `
                        <p>${day.date}: ${day.day.avgtemp_c}°C, ${day.day.condition.text}</p>
                        <img src="${day.day.condition.icon}" alt="Hava durumu ikonu">
                    `;
                });
                document.getElementById('forecastWeather').innerHTML = forecastHTML;

                const uvIndex = current.uv;
                let uvMessage = '';
                if (uvIndex <= 2) {
                    uvMessage = 'Zararsız';
                } else if (uvIndex <= 5) {
                    uvMessage = 'Güneş kremi kullanın';
                } else if (uvIndex <= 7) {
                    uvMessage = 'Koruyucu giysiler giyin';
                } else if (uvIndex <= 10) {
                    uvMessage = 'Gölge arayın';
                } else {
                    uvMessage = 'Aşırı risk. Dışarı çıkmayın';
                }

                document.getElementById('additionalInfo').innerHTML = `
                    <p class="sml-box"><b>UV İndeksi</b> ${uvMessage}</p>                    
                    <p class="sml-box"><b>Nem</b> ${current.humidity}% </p>
                    <p class="sml-box"><b>Basınç</b> ${current.pressure_mb} mb</p>
                    <p class="sml-box"><b>Rüzgar</b> ${current.wind_kph} km/h</p>
                `;
                document.getElementById('getLocationBtn').style.display = 'none'; // İzin alındıktan sonra butonu gizle
            }
        })
        .catch(error => {
            document.getElementById('weatherInfo').innerHTML = `<p>Hata: ${error.message}</p>`;
            console.error('There was a problem with the fetch operation:', error);
        });
}

function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            document.getElementById('weatherInfo').innerHTML = `<p>Kullanıcı konum izni vermedi.</p>`;
            document.getElementById('getLocationBtn').style.display = 'block';
            requestLocation(); // Tekrar izin iste
            break;
        case error.POSITION_UNAVAILABLE:
            document.getElementById('weatherInfo').innerHTML = `<p>Konum bilgisi mevcut değil.</p>`;
            break;
        case error.TIMEOUT:
            document.getElementById('weatherInfo').innerHTML = `<p>Konum isteği zaman aşımına uğradı.</p>`;
            break;
        case error.UNKNOWN_ERROR:
            document.getElementById('weatherInfo').innerHTML = `<p>Bilinmeyen bir hata oluştu.</p>`;
            break;
    }
}