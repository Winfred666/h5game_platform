import { Paper } from "@mui/material";
import React from "react";

const Footer: React.FC = () => {
  return (
    <Paper elevation={1} className=" z-10">
      <div>
        <h3>Contact Us</h3>
        <p>Email: info@example.com</p>
        <p>Phone: 123-456-7890</p>
        <p>Address: 123 Main St, City, State, ZIP</p>
      </div>
      <div>
        <h3>About</h3>
        <p>        </p>
      </div>
    </Paper>
  );
};

export default Footer;
