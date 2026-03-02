'use client';

import { useState, useEffect, useCallback } from 'react';

type DeviceStatus = {
  userAgent: string;
  userAgentMobile: boolean | null;
  windowInnerWidth: number;
  windowInnerHeight: number;
  windowScreenWidth: number;
  windowScreenHeight: number;
  maxTouchPoints: number;
  pointerCoarse: boolean;
  hoverNone: boolean;
  orientation: string;
  isMobileDevice: boolean;
  isDesktopModeOnMobile: boolean;
};

const getInitialDeviceStatus = (): DeviceStatus => {
  return {
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    userAgentMobile: null, // 初期値は不明
    windowInnerWidth: typeof window !== 'undefined' ? window.innerWidth : 0,
    windowInnerHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
    windowScreenWidth: typeof window !== 'undefined' ? window.screen.width : 0,
    windowScreenHeight: typeof window !== 'undefined' ? window.screen.height : 0,
    maxTouchPoints: typeof navigator !== 'undefined' ? navigator.maxTouchPoints : 0,
    pointerCoarse: typeof window !== 'undefined' ? window.matchMedia('(pointer: coarse)').matches : false,
    hoverNone: typeof window !== 'undefined' ? window.matchMedia('(hover: none)').matches : false,
    orientation: typeof window !== 'undefined' ? (window.screen.orientation ? window.screen.orientation.type : 'N/A') : 'N/A',
    isMobileDevice: false,
    isDesktopModeOnMobile: false,
  };
};

export default function Home() {
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>(getInitialDeviceStatus);

  const updateDeviceStatus = useCallback(async () => {
    let userAgentMobile: boolean | null = null;
    if (typeof navigator !== 'undefined' && (navigator as any).userAgentData) {
      try {
        const uaData = await (navigator as any).userAgentData.getHighEntropyValues(["mobile"]);
        userAgentMobile = uaData.mobile;
      } catch (e) {
        console.error("Failed to get high entropy User-Agent Client Hints:", e);
      }
    }

    const currentScreenWidth = typeof window !== 'undefined' ? window.screen.width : 0;
    const currentWindowInnerWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
    const currentMaxTouchPoints = typeof navigator !== 'undefined' ? navigator.maxTouchPoints : 0;
    const isCoarsePointer = typeof window !== 'undefined' ? window.matchMedia('(pointer: coarse)').matches : false;
    const isHoverNone = typeof window !== 'undefined' ? window.matchMedia('(hover: none)').matches : false;
    
    // 判定ロジック
    // User-Agent Client Hintsがモバイルと判断、または
    // タッチポイントがあり、かつ一般的なデスクトップの画面幅以下（タッチ対応PCとの区別のため）
    // または、ホバーができない
    const detectedAsMobile = 
      (userAgentMobile !== null && userAgentMobile) ||
      (currentMaxTouchPoints > 0 && currentScreenWidth <= 1280) || // 一般的なPCモニタは1280px以上
      isHoverNone;

    // モバイルデバイスと判定された上で、かつ表示幅が物理画面幅よりかなり広い場合
    // (スマホでPCモードにした際の典型的な挙動)
    const detectedAsDesktopModeOnMobile = 
      detectedAsMobile && 
      currentWindowInnerWidth > currentScreenWidth + 100 && // 物理画面幅より100px以上広ければ、PCモードと判断
      currentScreenWidth < 1024; // かつ、元々の物理画面幅がモバイル/タブレットサイズであること


    setDeviceStatus({
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
      userAgentMobile: userAgentMobile,
      windowInnerWidth: currentWindowInnerWidth,
      windowInnerHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
      windowScreenWidth: currentScreenWidth,
      windowScreenHeight: typeof window !== 'undefined' ? window.screen.height : 0,
      maxTouchPoints: currentMaxTouchPoints,
      pointerCoarse: isCoarsePointer,
      hoverNone: isHoverNone,
      orientation: typeof window !== 'undefined' ? (window.screen.orientation ? window.screen.orientation.type : 'N/A') : 'N/A',
      isMobileDevice: detectedAsMobile,
      isDesktopModeOnMobile: detectedAsDesktopModeOnMobile,
    });
  }, []);

  useEffect(() => {
    updateDeviceStatus();

    const handleResize = () => updateDeviceStatus();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateDeviceStatus]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">デバイス判定デモ</h1>

      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4">判定結果:</h2>
        <div className="mb-4 p-4 border rounded-md">
          <p className="text-xl font-bold">
            このデバイスは{' '}
            {deviceStatus.isDesktopModeOnMobile ? (
              <span className="text-orange-600">モバイルデバイス (PCモード)</span>
            ) : deviceStatus.isMobileDevice ? (
              <span className="text-blue-600">モバイルデバイス</span>
            ) : (
              <span className="text-green-600">デスクトップデバイス</span>
            )}{' '}
            と判定されました。
          </p>
          {deviceStatus.isDesktopModeOnMobile && (
            <p className="text-sm text-gray-700 mt-2">
              <span className="font-semibold">補足:</span>
              物理画面サイズがモバイル相当でありながら、表示領域が大幅に拡大されているため、モバイルのPCモードである可能性が高いです。
            </p>
          )}
        </div>

        <h2 className="text-2xl font-semibold mb-4 mt-8">詳細ステータス:</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-md shadow-sm">
            <h3 className="text-lg font-medium mb-2">User Agent:</h3>
            <p className="text-sm break-all">{deviceStatus.userAgent}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md shadow-sm">
            <h3 className="text-lg font-medium mb-2">User-Agent Client Hints (mobile):</h3>
            <p className="text-sm">{deviceStatus.userAgentMobile !== null ? String(deviceStatus.userAgentMobile) : '未サポートまたは取得中'}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md shadow-sm">
            <h3 className="text-lg font-medium mb-2">window.innerWidth (表示幅):</h3>
            <p className="text-sm">{deviceStatus.windowInnerWidth} px</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md shadow-sm">
            <h3 className="text-lg font-medium mb-2">window.innerHeight (表示高):</h3>
            <p className="text-sm">{deviceStatus.windowInnerHeight} px</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md shadow-sm">
            <h3 className="text-lg font-medium mb-2">window.screen.width (物理画面幅):</h3>
            <p className="text-sm">{deviceStatus.windowScreenWidth} px</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md shadow-sm">
            <h3 className="text-lg font-medium mb-2">window.screen.height (物理画面高):</h3>
            <p className="text-sm">{deviceStatus.windowScreenHeight} px</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md shadow-sm">
            <h3 className="text-lg font-medium mb-2">navigator.maxTouchPoints (最大タッチ点数):</h3>
            <p className="text-sm">{deviceStatus.maxTouchPoints}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md shadow-sm">
            <h3 className="text-lg font-medium mb-2">@media (pointer: coarse):</h3>
            <p className="text-sm">{String(deviceStatus.pointerCoarse)} (指での操作を検出)</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md shadow-sm">
            <h3 className="text-lg font-medium mb-2">@media (hover: none):</h3>
            <p className="text-sm">{String(deviceStatus.hoverNone)} (ホバー操作不可を検出)</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md shadow-sm">
            <h3 className="text-lg font-medium mb-2">screen.orientation.type (画面向き):</h3>
            <p className="text-sm">{deviceStatus.orientation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
