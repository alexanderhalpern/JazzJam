import { Affix, Input, Menu } from "antd";
import React, { useState } from "react";
import {
  Button,
  Container,
  Form,
  FormControl,
  Nav,
  Navbar,
} from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useHistory } from "react-router-dom";
import "./boot.css";
import "./Header.css";
const logo = require("../logo.svg");

const { SubMenu } = Menu;
const { Search } = Input;

function Header() {
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState(false);

  const history = useHistory();
  const fontSize = {
    fontSize: "100%",
  };

  const onSearch = (event) => {
    event.preventDefault();
    let params = new URLSearchParams();
    params.append("search", search);
    closeNav();
    history.push({
      pathname: "/",
      search: params.toString(),
    });
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  const closeNav = () => {
    setExpanded(false);
  };

  return (
    <Navbar
      fixed="top"
      onToggle={toggleExpanded}
      expanded={expanded}
      style={{
        paddingTop: "env(safe-area-inset-top)",
      }}
      bg="dark"
      variant="dark"
      expand="lg"
    >
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand onClick={closeNav}>
            <img src={logo} width="120" />
          </Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav onSelect={closeNav} className="me-auto">
            <LinkContainer to="/">
              <Nav.Link>Home</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/post">
              <Nav.Link>Gigs</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/messaging">
              <Nav.Link>Messages</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/myprofile">
              <Nav.Link>My Profile</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/logout">
              <Nav.Link>Log out</Nav.Link>
            </LinkContainer>
          </Nav>
          <Form noValidate onSubmit={onSearch} className="d-flex">
            <FormControl
              type="search"
              placeholder="Search users and instruments"
              style={{ width: 250 }}
              className="mr-2"
              aria-label="Search"
              id="search"
              onChange={(event) => setSearch(event.target.value)}
            />
            <Button type="submit">Search</Button>
          </Form>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

{
  /* <Menu mode="horizontal">
        <Menu.Item key="logo">
          <Link to="/">
            <h2>JazzJam</h2>
          </Link>
        </Menu.Item>
        <Menu.Item style={{ display: "flex", alignItems: "center" }}>
          <Search
            placeholder="Search Instruments and Users"
            allowClear
            onSearch={onSearch}
            style={{ width: 200 }}
          />
        </Menu.Item>
        <Menu.Item key="home" icon={<HomeOutlined />}>
          <Link to="/">Go Home</Link>
        </Menu.Item>
        <Menu.Item key="messaging" icon={<MessageOutlined />}>
          <Link to="/messaging">View Messages</Link>
        </Menu.Item>
        <Menu.Item key="myprofile" icon={<UserOutlined />}>
          <Link to="/myprofile">View Your Profile</Link>
        </Menu.Item>
        <Menu.Item key="post" icon={<SendOutlined />}>
          <Link to="/post">Post</Link>
        </Menu.Item>
      </Menu> */
}
export default Header;
