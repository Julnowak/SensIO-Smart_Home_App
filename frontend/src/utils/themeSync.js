export const syncThemeStyles = (mode) => {
  const style = document.documentElement.style;
  if (mode === 'dark') {
    style.setProperty('--bg-color', '#121212');
    style.backgroundColor = '#121212';
  } else {
    style.setProperty('--bg-color', '#ffffff');
    style.backgroundColor = '#ffffff';
  }
};