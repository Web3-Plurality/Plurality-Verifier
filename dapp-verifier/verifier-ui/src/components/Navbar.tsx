import { Nav, NavLink, NavMenu } from "./NavbarElements";
  
const Navbar = () => {
  return (
    <>
      <Nav>
        <NavMenu>
        <NavLink to="/auth">
            Create
          </NavLink>
          <NavLink to="/verifier">
            Link
          </NavLink>
          <NavLink to="/dapp">
            Verify
          </NavLink>
        </NavMenu>
      </Nav>
    </>
  );
};
  
export default Navbar;