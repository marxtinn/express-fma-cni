module.exports = {
  generate: () => {
    const chars = "123456789ABCDEFGHIJKLMNOPRSTUVWXYZ";
    let captcha = "";
    for (let i = 0; i < 6; i++) {
      const pos = Math.floor(Math.random() * chars.length);
      captcha += chars.charAt(pos);
    }
    return captcha;
  },
};
