import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Container, Nav, Navbar as RBNavbar, Button } from "react-bootstrap";
import logo from "../../../assets/watheeq.jpeg";
import "./Navbar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showTranslateDropdown, setShowTranslateDropdown] = useState(false);
  const translateRef = useRef(null);
  
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const handleLogin = () => navigate("/login"); 
  const handleSignup = () => navigate("/signup");

  // Programmatically change language
  const changeLanguage = (langCode) => {
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event('change'));
    }
    setShowTranslateDropdown(false);
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (translateRef.current && !translateRef.current.contains(event.target)) {
        setShowTranslateDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Google Translate Setup
  useEffect(() => {
    const scriptId = "google-translate-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      document.body.appendChild(script);
    }

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "en",
          includedLanguages: "en,ar"
        },
        "google_translate_element_hidden"
      );

      // Set default language to Arabic
      setTimeout(() => changeLanguage('ar'), 1000);
    };

    // Hide Google Translate banner
    const interval = setInterval(() => {
      const iframe = document.querySelector(".goog-te-banner-frame");
      const skipTranslate = document.querySelector(".skiptranslate");
      if (iframe) iframe.style.display = "none";
      if (skipTranslate) skipTranslate.style.display = "none";
      document.body.style.top = "0px";
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Watch Google Translate select for language changes
  useEffect(() => {
    const interval = setInterval(() => {
      const select = document.querySelector(".goog-te-combo");
      if (select) {
        select.addEventListener("change", () => {
          if (select.value === "ar") {
            document.documentElement.dir = "rtl";
            document.body.classList.add("rtl-mode");
          } else {
            document.documentElement.dir = "ltr";
            document.body.classList.remove("rtl-mode");
          }
        });
        clearInterval(interval);
      }
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <RBNavbar expand="lg" className="custom-navbar navbar-animate" collapseOnSelect>
      <Container fluid>
        {/* LOGO */}
        <Link to="/" className="d-flex align-items-center text-decoration-none">
          <img src={logo} alt="Watheeq Logo" width="110" height="auto" className="navbar-logo-img" />
        </Link>

        {/* TOGGLE */}
        <button className="custom-toggle d-lg-none" onClick={toggleMenu} aria-label="Toggle navigation">
          <div className="custom-hamburger">
            <span></span><span></span><span></span>
          </div>
        </button>

        {/* DESKTOP NAV */}
        <div className="d-none d-lg-flex align-items-center navbar-nav-links">
          <Nav className="me-auto d-flex align-items-center">
            <Link to="/" className="nav-link-strong mx-3">Home</Link>
            <Link to="/features" className="nav-link-strong mx-3">Features</Link>
            <Link to="/pricing" className="nav-link-strong mx-3">Pricing</Link>
            <Link to="/aboutus" className="nav-link-strong mx-3">About Us</Link>
            <Link to="/contact" className="nav-link-strong mx-3">Contact</Link>
          </Nav>

          {/* LANGUAGE SELECT */}
          <div className="language-selector mx-3" ref={translateRef}>
            <Button className="language-toggle-btn" onClick={() => setShowTranslateDropdown(!showTranslateDropdown)}>
              <i className="fas fa-globe me-2"></i> العربية
            </Button>
            {showTranslateDropdown && (
              <div className="custom-translate-dropdown">
                <div className="lang-option" onClick={() => changeLanguage('en')}>English</div>
                <div className="lang-option" onClick={() => changeLanguage('ar')}>العربية</div>
              </div>
            )}
          </div>

          {/* BUTTONS */}
          <div className="d-flex align-items-center">
            <Button variant="brand-outline" className="btn-brand-outline mx-1" onClick={handleLogin}>Login</Button>
            <Button variant="brand" className="btn-brand mx-1" onClick={handleSignup}>Sign Up</Button>
          </div>
        </div>

        {/* MOBILE MENU */}
        {isMenuOpen && (
          <div className="custom-navbar-collapse d-lg-none text-center">
            <Nav className="navbar-nav-mobile flex-column">
              <Link to="/" className="nav-link-mobile" onClick={toggleMenu}>Home</Link>
              <Link to="/features" className="nav-link-mobile" onClick={toggleMenu}>Features</Link>
              <Link to="/pricing" className="nav-link-mobile" onClick={toggleMenu}>Pricing</Link>
              <Link to="/aboutus" className="nav-link-mobile" onClick={toggleMenu}>About Us</Link>
              <Link to="/contact" className="nav-link-mobile" onClick={toggleMenu}>Contact</Link>
            </Nav>

            <div className="language-selector-mobile my-3" ref={translateRef}>
              <Button className="language-toggle-btn" onClick={() => setShowTranslateDropdown(!showTranslateDropdown)}>
                <i className="fas fa-globe me-2"></i> العربية
              </Button>
              {showTranslateDropdown && (
                <div className="custom-translate-dropdown-mobile">
                  <div className="lang-option" onClick={() => changeLanguage('en')}>English</div>
                  <div className="lang-option" onClick={() => changeLanguage('ar')}>العربية</div>
                </div>
              )}
            </div>

            <div className="d-flex justify-content-center gap-2">
              <Button variant="brand-outline" className="btn-brand-outline" onClick={handleLogin}>Login</Button>
              <Button variant="brand" className="btn-brand" onClick={handleSignup}>Sign Up</Button>
            </div>
          </div>
        )}
      </Container>

      {/* HIDDEN GOOGLE TRANSLATE DIV */}
      <div id="google_translate_element_hidden" style={{display: 'none', visibility: 'hidden'}}></div>
    </RBNavbar>
  );
};

export default Navbar;
