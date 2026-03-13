/*
 * @Author: bigzhuzhu 1327838903@qq.com
 * @Date: 2026-03-13 16:30:09
 * @LastEditors: bigzhuzhu 1327838903@qq.com
 * @LastEditTime: 2026-03-13 16:30:19
 * @FilePath: \python_ai\DiaryApp\src\weatherService.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import axios from 'axios';

const OPENWEATHER_API_KEY = 'YOUR_OPENWEATHER_API_KEY'; // 需要替换为实际的 API key
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

export interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  city: string;
  country: string;
}

export async function getWeatherByCoordinates(
  latitude: number,
  longitude: number
): Promise<WeatherData> {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        lat: latitude,
        lon: longitude,
        appid: OPENWEATHER_API_KEY,
        units: 'metric',
        lang: 'zh_cn',
      },
    });

    const data = response.data;
    return {
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      city: data.name,
      country: data.sys.country,
    };
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    throw error;
  }
}

export async function getWeatherByCity(city: string): Promise<WeatherData> {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        q: city,
        appid: OPENWEATHER_API_KEY,
        units: 'metric',
        lang: 'zh_cn',
      },
    });

    const data = response.data;
    return {
      temperature: Math.round(data.main.temp),
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      city: data.name,
      country: data.sys.country,
    };
  } catch (error) {
    console.error('Failed to fetch weather:', error);
    throw error;
  }
}

export function getWeatherIconUrl(iconCode: string): string {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
}