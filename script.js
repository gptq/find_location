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

    // 全局变量存储位置信息
    let currentLatitude = null;
    let currentLongitude = null;

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
                
                // 保存当前位置
                currentLatitude = latitude;
                currentLongitude = longitude;
                
                // 显示位置详情
                latitudeElement.textContent = latitude.toFixed(6);
                longitudeElement.textContent = longitude.toFixed(6);
                accuracyElement.textContent = accuracy.toFixed(2);
                
                // 更新状态
                statusElement.textContent = '位置获取成功！';
                
                // 显示位置详情和刷新按钮
                locationDetails.classList.remove('hidden');
                refreshLocationBtn.classList.remove('hidden');
                
                // 显示百度地图
                showBaiduMap(latitude, longitude);
                
                // 尝试使用IP地址获取大致位置信息
                getApproximateLocation();
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
                
                // 如果获取精确位置失败，尝试使用IP地址获取大致位置
                getApproximateLocation();
            },
            // 选项
            {
                enableHighAccuracy: true, // 尝试获取最精确的位置
                timeout: 10000,          // 10秒超时
                maximumAge: 0            // 不使用缓存的位置
            }
        );
    }

    // 使用IP地址获取大致位置信息
    function getApproximateLocation() {
        addressElement.textContent = '正在获取地址信息...';
        
        // 使用ipinfo.io的免费API获取基于IP的位置信息
        fetch('https://ipinfo.io/json')
            .then(response => response.json())
            .then(data => {
                if (data && data.city && data.region && data.country) {
                    const address = `${data.city}, ${data.region}, ${data.country}`;
                    addressElement.textContent = `大致位置: ${address}`;
                    
                    // 如果没有精确位置，使用IP位置显示地图
                    if (!currentLatitude && !currentLongitude && data.loc) {
                        const [lat, lon] = data.loc.split(',');
                        if (lat && lon) {
                            currentLatitude = parseFloat(lat);
                            currentLongitude = parseFloat(lon);
                            showBaiduMap(currentLatitude, currentLongitude);
                        }
                    }
                } else {
                    addressElement.textContent = '无法获取位置信息';
                }
            })
            .catch(error => {
                console.error('获取IP位置信息失败:', error);
                addressElement.textContent = '无法获取位置信息';
            });
    }

    // 显示百度地图
    function showBaiduMap(latitude, longitude) {
        mapElement.classList.remove('hidden');
        mapElement.innerHTML = '';
        
        // 创建地图容器
        const mapContainer = document.createElement('div');
        mapContainer.id = 'baiduMap';
        mapContainer.style.width = '100%';
        mapContainer.style.height = '400px';
        mapContainer.style.borderRadius = '8px';
        mapContainer.style.border = '1px solid #ddd';
        
        mapElement.appendChild(mapContainer);
        
        // 创建百度地图脚本
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://api.map.baidu.com/api?v=2.0&callback=initBaiduMap';
        document.body.appendChild(script);
        
        // 初始化百度地图的全局函数
        window.initBaiduMap = function() {
            // 创建百度地图实例
            const map = new BMap.Map('baiduMap');
            
            // 坐标转换（WGS84坐标系转换为百度坐标系）
            const point = new BMap.Point(longitude, latitude);
            
            // 初始化地图，设置中心点坐标和地图级别
            map.centerAndZoom(point, 15);
            
            // 添加地图控件
            map.addControl(new BMap.NavigationControl());  // 添加平移缩放控件
            map.addControl(new BMap.ScaleControl());       // 添加比例尺控件
            map.addControl(new BMap.OverviewMapControl()); // 添加缩略地图控件
            map.enableScrollWheelZoom();                   // 启用滚轮放大缩小
            
            // 添加标记点
            const marker = new BMap.Marker(point);
            map.addOverlay(marker);
            
            // 添加信息窗口
            const infoWindow = new BMap.InfoWindow('您的位置', {
                width: 200,
                height: 60,
                title: '当前位置'
            });
            
            marker.addEventListener('click', function() {
                this.openInfoWindow(infoWindow);
            });
            
            // 自动打开信息窗口
            marker.openInfoWindow(infoWindow);
        };
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
