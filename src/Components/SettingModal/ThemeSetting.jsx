import React from "react";
import { useTheme } from "../../themeContext";
import { Form, Button, Row, Col } from "react-bootstrap";

const ThemeSetting = () => {
    const { 
        theme, 
        toggleTheme, 
        customColors, 
        updateCustomColors,
        layout,
        updateLayout,
        sidebarColor,
        updateSidebarColor,
        topbarColor,
        updateTopbarColor,
        resetTheme
    } = useTheme();

    const handleColorChange = (colorKey, value) => {
        updateCustomColors({
            ...customColors,
            [colorKey]: value
        });
    };

    const predefinedThemes = [
        {
            name: "Default",
            colors: {
                primary: "#53b2a5",
                secondary: "#6c757d",
                success: "#198754",
                danger: "#dc3545",
                warning: "#ffc107",
                info: "#0dcaf0"
            }
        },
        {
            name: "Blue Theme",
            colors: {
                primary: "#0d6efd",
                secondary: "#6c757d",
                success: "#198754",
                danger: "#dc3545",
                warning: "#ffc107",
                info: "#0dcaf0"
            }
        },
        {
            name: "Purple Theme",
            colors: {
                primary: "#6f42c1",
                secondary: "#6c757d",
                success: "#198754",
                danger: "#dc3545",
                warning: "#ffc107",
                info: "#0dcaf0"
            }
        },
        {
            name: "Green Theme",
            colors: {
                primary: "#198754",
                secondary: "#6c757d",
                success: "#20c997",
                danger: "#dc3545",
                warning: "#ffc107",
                info: "#0dcaf0"
            }
        }
    ];

    const applyPredefinedTheme = (themeColors) => {
        updateCustomColors({
            ...customColors,
            ...themeColors
        });
    };

    return (
        <div className="theme-setting">
            {/* Theme Mode Toggle */}
            <div className="mb-4">
                <h6 className="fw-semibold mb-3">Theme Mode</h6>
                <div className="d-flex gap-2">
                    <Button
                        variant={theme === "light" ? "primary" : "outline-primary"}
                        size="sm"
                        onClick={() => theme !== "light" && toggleTheme()}
                    >
                        Light
                    </Button>
                    <Button
                        variant={theme === "dark" ? "primary" : "outline-secondary"}
                        size="sm"
                        onClick={() => theme !== "dark" && toggleTheme()}
                    >
                        Dark
                    </Button>
                </div>
            </div>

            {/* Predefined Themes */}
            <div className="mb-4">
                <h6 className="fw-semibold mb-3">Predefined Themes</h6>
                <div className="d-flex flex-wrap gap-2">
                    {predefinedThemes.map((preTheme, index) => (
                        <Button
                            key={index}
                            variant="outline-secondary"
                            size="sm"
                            onClick={() => applyPredefinedTheme(preTheme.colors)}
                            style={{ fontSize: "12px" }}
                        >
                            {preTheme.name}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Custom Colors */}
            <div className="mb-4">
                <h6 className="fw-semibold mb-3">Custom Colors</h6>
                <Row className="g-2">
                    {Object.entries(customColors).map(([key, value]) => (
                        <Col xs={6} key={key}>
                            <Form.Group>
                                <Form.Label className="small text-capitalize">{key}</Form.Label>
                                <div className="d-flex align-items-center gap-2">
                                    <input
                                        type="color"
                                        value={value}
                                        onChange={(e) => handleColorChange(key, e.target.value)}
                                        className="form-control form-control-color"
                                        style={{ width: "40px", height: "30px", padding: "2px" }}
                                    />
                                    <Form.Control
                                        type="text"
                                        value={value}
                                        onChange={(e) => handleColorChange(key, e.target.value)}
                                        size="sm"
                                        style={{ fontSize: "11px" }}
                                    />
                                </div>
                            </Form.Group>
                        </Col>
                    ))}
                </Row>
            </div>

            {/* <div className="mb-4">
                <h6 className="fw-semibold mb-3">Sidebar Color</h6>
                <div className="d-flex align-items-center gap-2">
                    <input
                        type="color"
                        value={sidebarColor}
                        onChange={(e) => updateSidebarColor(e.target.value)}
                        className="form-control form-control-color"
                        style={{ width: "40px", height: "30px", padding: "2px" }}
                    />
                    <Form.Control
                        type="text"
                        value={sidebarColor}
                        onChange={(e) => updateSidebarColor(e.target.value)}
                        size="sm"
                    />
                </div>
            </div>

            <div className="mb-4">
                <h6 className="fw-semibold mb-3">Topbar Color</h6>
                <div className="d-flex align-items-center gap-2">
                    <input
                        type="color"
                        value={topbarColor}
                        onChange={(e) => updateTopbarColor(e.target.value)}
                        className="form-control form-control-color"
                        style={{ width: "40px", height: "30px", padding: "2px" }}
                    />
                    <Form.Control
                        type="text"
                        value={topbarColor}
                        onChange={(e) => updateTopbarColor(e.target.value)}
                        size="sm"
                    />
                </div>
            </div> */}

            {/* Layout Options */}
            {/* <div className="mb-4">
                <h6 className="fw-semibold mb-3">Layout Style</h6>
                <div className="d-flex flex-column gap-2">
                    {["default", "mini", "no-header"].map((layoutOption) => (
                        <Button
                            key={layoutOption}
                            variant={layout === layoutOption ? "primary" : "outline-secondary"}
                            size="sm"
                            onClick={() => updateLayout(layoutOption)}
                            className="text-start"
                        >
                            {layoutOption.charAt(0).toUpperCase() + layoutOption.slice(1).replace("-", " ")}
                        </Button>
                    ))}
                </div>
            </div> */}

            {/* Reset Button */}
            <div className="mt-4">
                <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={resetTheme}
                    className="w-100"
                >
                    Reset to Default
                </Button>
            </div>
        </div>
    );
};

export default ThemeSetting;