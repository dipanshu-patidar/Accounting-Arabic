import React, { useState } from "react";
import { Button, Offcanvas, Form } from "react-bootstrap";
import { useTheme } from "../themeContext";
import "./SettingModal.css";
import defaultsidebar from "../../src/assets/defaultsidebar.jpeg";
import minilayout from "../../src/assets/minilayout.jpeg";
import withoutheader from "../../src/assets/withoutheader.jpeg";
import ThemeSetting from "./SettingModal/ThemeSetting";

const SettingModal = ({ show, handleClose }) => {
  const { 
    layout, 
    updateLayout, 
    sidebarColor, 
    updateSidebarColor, 
    topbarColor, 
    updateTopbarColor,
    resetTheme 
  } = useTheme();
  
  const [layoutWidth, setLayoutWidth] = useState("fluid");

  const layoutImages = [
    { id: "default", src: defaultsidebar, alt: "Default", name: "Default" },
    { id: "mini", src: minilayout, alt: "Mini", name: "Mini Layout" },
    { id: "no-header", src: withoutheader, alt: "No Header", name: "No-Header" },
  ];

  const topbarColors = ["#ffffff", "#000000", "#6c757d", "#0d6efd", "#6610f2", "#20c997", "#6366f1"];

  const sidebarColors = ["#032d45", "#343a40", "#f8f9fa", "#6f42c1", "#d63384", "#198754"];

  // Save settings and close
  const handleApply = () => {
    handleClose();
  };


  return (
    <Offcanvas show={show} onHide={handleClose} placement="end">
      <Offcanvas.Header closeButton className="border-bottom">
        <Offcanvas.Title className="fw-bold">Theme Customizer</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        <small className="text-muted">Choose your themes & layouts etc.</small>

        {/* Layouts */}
        <div className="mt-4">
          <h6 className="fw-semibold">Select Layouts</h6>
          <div className="d-flex gap-3 mt-2">
            {layoutImages.map((item) => (
              <img
                key={item.id}
                src={item.src}
                alt={item.alt}
                className={`layout-img rounded ${layout === item.id ? "border border-primary" : ""}`}
                onClick={() => updateLayout(item.id)}
                style={{ cursor: "pointer", width: "80px" }}
              />
            ))}
          </div>
        </div>

        {/* Layout Width */}
        <div className="mt-4">
          <h6 className="fw-semibold">Layout Width</h6>
          <div className="d-flex gap-3 mt-2">
            <Button
              variant={layoutWidth === "fluid" ? "primary" : "outline-secondary"}
              size="sm"
              onClick={() => setLayoutWidth("fluid")}
            >
              Fluid Layout
            </Button>
            <Button
              variant={layoutWidth === "boxed" ? "primary" : "outline-secondary"}
              size="sm"
              onClick={() => setLayoutWidth("boxed")}
            >
              Boxed Layout
            </Button>
          </div>
        </div>

        {/* Top Bar Color */}
        <div className="mt-4">
          <h6 className="fw-semibold">Top Bar Color</h6>
          <div className="d-flex flex-wrap gap-2 mt-2">
            {topbarColors.map((color) => (
              <div
                key={color}
                className={`color-box rounded ${topbarColor === color ? "border border-dark border-2" : ""}`}
                style={{ backgroundColor: color, width: "30px", height: "30px", cursor: "pointer" }}
                onClick={() => updateTopbarColor(color)}
              ></div>
            ))}
          </div>
        </div>

        {/* Sidebar Color */}
        <div className="mt-4">
          <h6 className="fw-semibold">Sidebar Color</h6>
          <div className="d-flex flex-wrap gap-2 mt-2">
            {sidebarColors.map((color) => (
              <div
                key={color}
                className={`color-box rounded ${sidebarColor === color ? "border border-dark border-2" : ""}`}
                style={{ backgroundColor: color, width: "30px", height: "30px", cursor: "pointer" }}
                onClick={() => updateSidebarColor(color)}
              ></div>
            ))}
          </div>
        </div>

        {/* Theme Mode */}
        <div className="mt-4">
          <ThemeSetting />
        </div>

        {/* Footer Actions */}
        <div className="mt-4 d-flex justify-content-between align-items-center">
          <Button variant="outline-secondary" size="sm" onClick={resetTheme}>
            Reset
          </Button>
          <Button variant="primary" size="sm" onClick={handleApply}>
            Apply
          </Button>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default SettingModal;