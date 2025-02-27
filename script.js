document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const getLocationBtn = document.getElementById('get-location');
    const refreshLocationBtn = document.getElementById('refresh-location');
    const statusElement = document.getElementById('status');
    const locationDetails = document.getElementById('location-details');
    const latitudeElement = document.getElementById('latitude');
    const longitudeElement = document.getElementById('longitude');
    const accuracyElement = document.getElementById('accuracy');
    const addressElement = document.getElementById('address');
    const errorMessageElement = document.getElementById('error-message');
    const mapElement = document.getElementById('map');

    // 初始化地图变量
    let map;
    let marker;

    // 获取位置的函数
    function getLocation() {
        // 清除之前的错误信息
        errorMessageElement.textContent = '';
        errorMessageElement.classList.add('hidden');
        
        // 更新状态
        statusElement.textContent = '正在获取位置信息...';
        
        // 检查浏览器是否支持地理位置
        if (!navigator.geolocation) {
            showError('您的浏览器不支持地理位置功能。请更新您的浏览器或尝试使用其他浏览器。');
            return;
        }

        // 获取地理位置
        navigator.geolocation.getCurrentPosition(
            // 成功回调
            (position) => {
                const { latitude, longitude, accuracy } = position.coords;
                
                // 显示位置详情
                latitudeElement.textContent = latitude.toFixed(6);
                longitudeElement.textContent = longitude.toFixed(6);
                accuracyElement.textContent = accuracy.toFixed(2);
                
                // 更新状态
                statusElement.textContent = '位置获取成功！';
                
                // 显示位置详情和刷新按钮
                locationDetails.classList.remove('hidden');
                refreshLocationBtn.classList.remove('hidden');
                
                // 获取地址
                getAddressFromCoordinates(latitude, longitude);
                
                // 显示地图
                showMap(latitude, longitude);
            },
            // 错误回调
            (error) => {
                let errorMessage;
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = '您拒绝了位置请求。请在浏览器设置中允许位置访问。';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = '位置信息不可用。请检查您的设备设置。';
                        break;
                    case error.TIMEOUT:
                        errorMessage = '获取位置超时。请稍后再试。';
                        break;
                    default:
                        errorMessage = '获取位置时发生未知错误。';
                }
                showError(errorMessage);
            },
            // 选项
            {
                enableHighAccuracy: true, // 尝试获取最精确的位置
                timeout: 10000,          // 10秒超时
                maximumAge: 0            // 不使用缓存的位置
            }
        );
    }

    // 使用反向地理编码API获取地址
    function getAddressFromCoordinates(latitude, longitude) {
        addressElement.textContent = '正在获取地址信息...';
        
        // 使用OpenStreetMap的Nominatim服务进行反向地理编码
        // 注意：在生产环境中，应该使用自己的API密钥和适当的服务
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
        
        fetch(url, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'LocationFinderApp' // 添加用户代理以遵守Nominatim使用政策
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('获取地址信息失败');
            }
            return response.json();
        })
        .then(data => {
            if (data && data.display_name) {
                addressElement.textContent = data.display_name;
            } else {
                addressElement.textContent = '无法获取详细地址';
            }
        })
        .catch(error => {
            console.error('获取地址时出错:', error);
            addressElement.textContent = '获取地址信息失败，请稍后再试';
        });
    }

    // 显示地图
    function showMap(latitude, longitude) {
        // 检查是否已加载地图脚本
        if (typeof L === 'undefined') {
            // 如果没有加载Leaflet库，则加载它
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
            script.integrity = 'sha512-XQoYMqMTK8LvdxXYG3nZ448hOEQiglfqkJs1NOQV44cWnUrBc8PkAOcXy20w0vlaXaVUearIOBhiXZ5V3ynxwA==';
            script.crossOrigin = '';
            
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
            link.integrity = 'sha512-xodZBNTC5n17Xt2atTPuE1HxjVMSvLVW9ocqUKLsCC5CXdbqCmblAshOMAS6/keqq/sMZMZ19scR4PsZChSR7A==';
            link.crossOrigin = '';
            
            document.head.appendChild(link);
            document.body.appendChild(script);
            
            script.onload = () => {
                initMap(latitude, longitude);
            };
        } else {
            initMap(latitude, longitude);
        }
    }

    // 初始化地图
    function initMap(latitude, longitude) {
        mapElement.classList.remove('hidden');
        
        // 如果地图已经初始化，则更新位置
        if (map) {
            map.setView([latitude, longitude], 15);
            marker.setLatLng([latitude, longitude]);
        } else {
            // 初始化地图
            map = L.map('map').setView([latitude, longitude], 15);
            
            // 添加地图图层
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
            
            // 添加标记
            marker = L.marker([latitude, longitude]).addTo(map);
        }
    }

    // 显示错误信息
    function showError(message) {
        statusElement.textContent = '获取位置失败';
        errorMessageElement.textContent = message;
        errorMessageElement.classList.remove('hidden');
    }

    // 添加事件监听器
    getLocationBtn.addEventListener('click', getLocation);
    refreshLocationBtn.addEventListener('click', getLocation);
});
