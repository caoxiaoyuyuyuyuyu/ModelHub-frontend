export const randomString = (len: number) => { 
    return Math.random().toString(36).substring(2, len + 2);
}

export const getCurrentTime = () => { 
    return new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
}