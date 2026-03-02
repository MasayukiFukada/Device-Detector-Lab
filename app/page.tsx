"use client";

import { useState, useEffect, useCallback } from "react";

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
  // Return placeholder values to avoid hydration mismatch
  // Actual values will be set in useEffect on the client
  return {
    userAgent: "Loading...",
    userAgentMobile: null,
    windowInnerWidth: 0,
    windowInnerHeight: 0,
    windowScreenWidth: 0,
    windowScreenHeight: 0,
    maxTouchPoints: 0,
    pointerCoarse: false,
    hoverNone: false,
    orientation: "N/A",
    isMobileDevice: false,
    isDesktopModeOnMobile: false,
  };
};

export default function Home() {
  const [deviceStatus, setDeviceStatus] = useState<DeviceStatus>(
    getInitialDeviceStatus,
  );

  const updateDeviceStatus = useCallback(async () => {
    let userAgentMobile: boolean | null = null;
    if (typeof navigator !== "undefined" && (navigator as any).userAgentData) {
      try {
        const uaData = await (
          navigator as any
        ).userAgentData.getHighEntropyValues(["mobile"]);
        userAgentMobile = uaData.mobile;
      } catch (e) {
        console.error("Failed to get high entropy User-Agent Client Hints:", e);
      }
    }

    const currentScreenWidth =
      typeof window !== "undefined" ? window.screen.width : 0;
    const currentWindowInnerWidth =
      typeof window !== "undefined" ? window.innerWidth : 0;
    const currentMaxTouchPoints =
      typeof navigator !== "undefined" ? navigator.maxTouchPoints : 0;
    const isCoarsePointer =
      typeof window !== "undefined"
        ? window.matchMedia("(pointer: coarse)").matches
        : false;
    const isHoverNone =
      typeof window !== "undefined"
        ? window.matchMedia("(hover: none)").matches
        : false;

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
      userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "N/A",
      userAgentMobile: userAgentMobile,
      windowInnerWidth: currentWindowInnerWidth,
      windowInnerHeight: typeof window !== "undefined" ? window.innerHeight : 0,
      windowScreenWidth: currentScreenWidth,
      windowScreenHeight:
        typeof window !== "undefined" ? window.screen.height : 0,
      maxTouchPoints: currentMaxTouchPoints,
      pointerCoarse: isCoarsePointer,
      hoverNone: isHoverNone,
      orientation:
        typeof window !== "undefined"
          ? window.screen.orientation
            ? window.screen.orientation.type
            : "N/A"
          : "N/A",
      isMobileDevice: detectedAsMobile,
      isDesktopModeOnMobile: detectedAsDesktopModeOnMobile,
    });
  }, []);

  useEffect(() => {
    // Set initial values from browser APIs
    setDeviceStatus({
      userAgent: navigator.userAgent,
      userAgentMobile: null,
      windowInnerWidth: window.innerWidth,
      windowInnerHeight: window.innerHeight,
      windowScreenWidth: window.screen.width,
      windowScreenHeight: window.screen.height,
      maxTouchPoints: navigator.maxTouchPoints,
      pointerCoarse: window.matchMedia("(pointer: coarse)").matches,
      hoverNone: window.matchMedia("(hover: none)").matches,
      orientation: window.screen.orientation
        ? window.screen.orientation.type
        : "N/A",
      isMobileDevice: false,
      isDesktopModeOnMobile: false,
    });

    // Then update with device detection logic
    updateDeviceStatus();

    const handleResize = () => updateDeviceStatus();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [updateDeviceStatus]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-900">
        デバイス判定デモ
      </h1>

      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">判定結果:</h2>
        <div className="mb-4 p-4 border rounded-md">
          <p className="text-xl font-bold text-gray-900">
            このデバイスは{" "}
            {deviceStatus.isDesktopModeOnMobile ? (
              <span className="text-orange-700">
                モバイルデバイス (PCモード)
              </span>
            ) : deviceStatus.isMobileDevice ? (
              <span className="text-blue-700">モバイルデバイス</span>
            ) : (
              <span className="text-green-700">デスクトップデバイス</span>
            )}{" "}
            と判定されました。
          </p>
          {deviceStatus.isDesktopModeOnMobile && (
            <p className="text-sm text-gray-800 mt-2">
              <span className="font-semibold">補足:</span>
              物理画面サイズがモバイル相当でありながら、表示領域が大幅に拡大されているため、モバイルのPCモードである可能性が高いです。
            </p>
          )}
        </div>

        <h2 className="text-2xl font-semibold mb-4 mt-8 text-gray-900">
          詳細ステータス:
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-md shadow-sm">
            <h3 className="text-lg font-medium mb-2 text-gray-900">
              User Agent:
            </h3>
            <p className="text-sm break-all text-gray-800">
              {deviceStatus.userAgent}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md shadow-sm">
            <h3 className="text-lg font-medium mb-2 text-gray-900">
              User-Agent Client Hints (mobile):
            </h3>
            <p className="text-sm text-gray-800">
              {deviceStatus.userAgentMobile !== null
                ? String(deviceStatus.userAgentMobile)
                : "未サポートまたは取得中"}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md shadow-sm">
            <h3 className="text-lg font-medium mb-2 text-gray-900">
              window.innerWidth (表示幅):
            </h3>
            <p className="text-sm text-gray-800">
              {deviceStatus.windowInnerWidth} px
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md shadow-sm">
            <h3 className="text-lg font-medium mb-2 text-gray-900">
              window.innerHeight (表示高):
            </h3>
            <p className="text-sm text-gray-800">
              {deviceStatus.windowInnerHeight} px
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md shadow-sm">
            <h3 className="text-lg font-medium mb-2 text-gray-900">
              window.screen.width (物理画面幅):
            </h3>
            <p className="text-sm text-gray-800">
              {deviceStatus.windowScreenWidth} px
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md shadow-sm">
            <h3 className="text-lg font-medium mb-2 text-gray-900">
              window.screen.height (物理画面高):
            </h3>
            <p className="text-sm text-gray-800">
              {deviceStatus.windowScreenHeight} px
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md shadow-sm">
            <h3 className="text-lg font-medium mb-2 text-gray-900">
              navigator.maxTouchPoints (最大タッチ点数):
            </h3>
            <p className="text-sm text-gray-800">
              {deviceStatus.maxTouchPoints}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md shadow-sm">
            <h3 className="text-lg font-medium mb-2 text-gray-900">
              @media (pointer: coarse):
            </h3>
            <p className="text-sm text-gray-800">
              {String(deviceStatus.pointerCoarse)} (指での操作を検出)
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md shadow-sm">
            <h3 className="text-lg font-medium mb-2 text-gray-900">
              @media (hover: none):
            </h3>
            <p className="text-sm text-gray-800">
              {String(deviceStatus.hoverNone)} (ホバー操作不可を検出)
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-md shadow-sm">
            <h3 className="text-lg font-medium mb-2 text-gray-900">
              screen.orientation.type (画面向き):
            </h3>
            <p className="text-sm text-gray-800">{deviceStatus.orientation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
