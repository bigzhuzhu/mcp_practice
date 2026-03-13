/*
 * @Author: bigzhuzhu 1327838903@qq.com
 * @Date: 2026-03-13 16:28:47
 * @LastEditors: bigzhuzhu 1327838903@qq.com
 * @LastEditTime: 2026-03-13 16:28:58
 * @FilePath: \python_ai\DiaryApp\src\types.ts
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export interface DiaryEntry {
  id: number;
  date: string; // YYYY-MM-DD format
  content: string;
  images: string[]; // base64 or file URIs
  videos: string[]; // file URIs
  city: string;
  weather: {
    temperature: number;
    description: string;
    icon: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LocationInfo {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}