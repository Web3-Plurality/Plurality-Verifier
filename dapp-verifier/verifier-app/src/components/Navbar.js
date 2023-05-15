import React from "react";
import { Nav, NavLink, NavMenu } from "./NavbarElements";
  
const Navbar = () => {
  return (
    <>
      <Nav>
        <NavMenu>
          {/*<NavLink to="/" activeStyle>
            Zero Knowledge Semaphore Demo
  </NavLink>*/}
          <NavLink to="/verifier">
            Verifier
          </NavLink>
          <NavLink to="/dapp">
            DApp
          </NavLink>
          <NavLink to="/revocation">
            Revocation
          </NavLink>
        </NavMenu>
      </Nav>
    </>
  );
};
  
export default Navbar;