import { useTheme } from '../themeContext';

export const useThemeClasses = () => {
  const { theme } = useTheme();
  
  return {
    // Container classes
    container: theme === 'dark' ? 'theme-dark' : 'theme-light',
    
    // Card classes
    card: 'theme-card',
    
    // Text classes
    text: 'theme-text',
    textMuted: 'text-muted',
    textPrimary: theme === 'dark' ? 'text-light' : 'text-primary',
    
    // Background classes
    bg: 'theme-bg',
    bgLight: theme === 'dark' ? 'bg-dark' : 'bg-light',
    
    // Table classes
    table: 'theme-table',
    tableLight: 'table-light',
    
    // Button classes
    btnPrimary: 'btn-primary',
    btnSecondary: 'btn-secondary',
    btnSuccess: 'btn-success',
    btnDanger: 'btn-danger',
    btnWarning: 'btn-warning',
    btnInfo: 'btn-info',
    
    // Border classes
    border: 'theme-border',
    
    // Form classes
    formControl: 'form-control',
    formSelect: 'form-select',
    
    // Modal classes
    modal: 'modal-content',
    
    // Get theme-aware style object
    getStyle: (baseStyle = {}) => ({
      ...baseStyle,
      backgroundColor: theme === 'dark' ? 'var(--bs-card-bg)' : baseStyle.backgroundColor,
      color: theme === 'dark' ? 'var(--bs-body-color)' : baseStyle.color,
    }),
    
    // Get theme-aware inline styles
    cardStyle: {
      backgroundColor: 'var(--bs-card-bg)',
      color: 'var(--bs-body-color)',
      borderColor: 'var(--bs-border-color)'
    },
    
    textStyle: {
      color: 'var(--bs-body-color)'
    },
    
    primaryStyle: {
      color: 'var(--bs-primary)'
    },
    
    bgStyle: {
      backgroundColor: 'var(--bs-body-bg)'
    }
  };
};