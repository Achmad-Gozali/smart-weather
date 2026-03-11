import { NextRequest, NextResponse } from 'next/server';

const OPENWEATHER_API_KEY = process.env.WEATHER_API_KEY;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get('city');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  if (!OPENWEATHER_API_KEY) {
    return NextResponse.json(
      { success: false, error: 'Weather API Key is not configured' },
      { status: 500 }
    );
  }

  let url = '';
  if (city) {
    url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=id`;
  } else if (lat && lon) {
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=id`;
  } else {
    return NextResponse.json(
      { success: false, error: 'City or coordinates are required' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: data.message || 'Failed to fetch weather data' },
        { status: response.status }
      );
    }

    const weatherData = {
      city: data.name,
      temp: Math.round(data.main.temp),
      condition: data.weather[0].main,
      description: data.weather[0].description,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      icon: data.weather[0].icon,
      feelsLike: Math.round(data.main.feels_like),
    };

    return NextResponse.json({ success: true, data: weatherData });
  } catch (error) {
    console.error('Weather API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
