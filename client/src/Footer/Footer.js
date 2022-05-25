import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <div className="footer">
      <div className="support">
        <p className="supportText">
          Contact Us at:
          <a
            style={{ marginLeft: "5px", marginRight: "5px" }}
            href="mailto:jazzjaminfo@gmail.com"
          >
            jazzjaminfo@gmail.com
          </a>
          | Copyright © 2022 JazzJam. All rights reserved.
        </p>
      </div>
    </div>
  );
}

export default Footer;
