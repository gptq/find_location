# 位置查询应用

这是一个简单的前端网页应用，用于获取用户的地理位置并显示详细地址信息。

## 功能

- 获取用户当前地理位置（经纬度）
- 显示位置精确度
- 通过IP地址获取大致位置信息
- 使用百度地图API显示位置（无需API密钥）
- 支持刷新位置信息

## 技术栈

- HTML5 Geolocation API：获取用户精确位置
- ipinfo.io API：获取基于IP的大致位置信息
- 百度地图API：显示交互式地图（无需API密钥）
- 纯JavaScript、HTML和CSS实现，无需其他依赖

## 使用方法

1. 打开`index.html`文件在浏览器中（推荐使用Chrome、Firefox或Edge等现代浏览器）
2. 点击"获取我的位置"按钮
3. 在浏览器提示时，允许网站访问您的位置
4. 等待位置信息和地址显示
5. 如需更新位置，点击"刷新位置"按钮

## 注意事项

- 使用前请确保您的浏览器支持地理位置功能
- 在移动设备上使用时，请确保已开启位置服务
- 为了获得最准确的位置，建议在户外或窗户附近使用
- 基于IP的位置信息仅为大致位置，精确度有限
- 本应用使用百度地图API，在中国大陆可以正常访问和使用

## 隐私说明

本应用仅在用户明确许可的情况下获取位置信息。位置数据仅用于显示，不会被存储或用于其他目的。使用ipinfo.io服务获取基于IP的位置信息时，仅传输IP地址，不传输其他个人数据。所有位置处理均在用户的浏览器中完成。
