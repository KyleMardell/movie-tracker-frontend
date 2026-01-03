"use client"

import { Container, Nav, Navbar, Button, Modal } from 'react-bootstrap';
import Link from 'next/link';
import { useAuth } from '../../useAuth';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useClickOutsideToggle from '../../hooks/useClickOutsideToggle';

// Nav bar displays different nav options for logged in or out user
const NavBar = () => {
    const { user } = useAuth();
    const { expanded, setExpanded, ref } = useClickOutsideToggle();
    const [showLogout, setShowLogout] = useState(false);
    const handleCloseLogout = () => setShowLogout(false);
    const handleShowLogout = () => setShowLogout(true);
    const router = useRouter()
    const { logout } = useAuth();

    // logs out the user
    const handleLogout = () => {
        logout();
        handleCloseLogout();
        router.push("/");
    };

    // checks for a user in the user context and renders the nav
    // displays a log out confirmation modal on log out
    return (
        <>
        <Navbar expanded={expanded} ref={ref} expand="lg">
            <Container>
                <Navbar.Brand as={Link} href="/">Movie Tracker</Navbar.Brand>
                <Navbar.Toggle onClick={() => setExpanded(!expanded)} aria-controls="navbar-nav" />
                <Navbar.Collapse id="navbar-nav">
                    <Nav className="me-auto">
                        {user ? 
                            <>
                            <Nav.Link as={Link} href="/" onClick={() => setExpanded(false)}>Home</Nav.Link>
                            <Nav.Link as={Link} href="/movieslist" onClick={() => setExpanded(false)}>My List</Nav.Link>
                            <Nav.Link as={Link} href="/search" onClick={() => setExpanded(false)}>Search</Nav.Link>
                            <Nav.Link onClick={() => {handleShowLogout(); setExpanded(false);}}>Log Out</Nav.Link>
                            </> :
                            <>
                            <Nav.Link as={Link} href="/" onClick={() => setExpanded(false)}>Home / Log In</Nav.Link>
                            <Nav.Link as={Link} href="/signup" onClick={() => setExpanded(false)}>Sign Up</Nav.Link>
                            </>
                        }
                    </Nav>
                </Navbar.Collapse>
            </Container>
        </Navbar>
        <Modal show={showLogout} onHide={handleCloseLogout}>
            <Modal.Body>Are you sure you want to log out?</Modal.Body>
            <Modal.Footer>
                <Button variant='secondary' onClick={handleCloseLogout}>Cancel</Button>
                <Button variant='primary' onClick={handleLogout}>Confirm Logout</Button>
            </Modal.Footer>
        </Modal>
        </>
    )
}

export default NavBar