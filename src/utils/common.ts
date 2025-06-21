export const randomString = (len: number) => { 
    return Math.random().toString(36).substring(2, len + 2);
}

export const getCurrentTime = () => { 
    // Asia/Shanghai
    return new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })
}

export const getCurrentStatus = () => { 
    const currentTime = getCurrentTime()
    const currentHour = Number(currentTime.split(' ')[1].split(':')[0])
    if (currentHour >= 6 && currentHour < 12) { 
        return '上午'
    } else if (currentHour >= 12 && currentHour < 18) { 
        return '下午'
    } else { 
        return '晚上'
    }
}