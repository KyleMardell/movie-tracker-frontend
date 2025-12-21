"use client"

import { Container, Nav, Navbar, Button, Modal } from 'react-bootstrap';
import Link from 'next/link';
import { useAuth } from '../../useAuth';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import useClickOutsideToggle from '../../hooks/useClickOutsideToggle';


const NavBar = () => {
    const { user } = useAuth();
    const { expanded, setExpanded, ref } = useClickOutsideToggle();
    const [showLogout, setShowLogout] = useState(false);
    const handleCloseLogout = () => setShowLogout(false);
    const handleShowLogout = () => setShowLogout(true);
    const router = useRouter()
    const { logout } = useAuth();
    const handleLogout = () => {
        logout();
        handleCloseLogout();
        router.push("/");
    };

    return (
        <>
        <Navbar expanded={expanded} ref={ref} expand="lg" className="bg-body-tertiary">
            <Container>
                <Navbar.Brand as={Link} href="/">Movie Tracker {user ? <> - {user}</> : <></>}</Navbar.Brand>
                <Navbar.Toggle onClick={() => setExpanded(!expanded)} aria-controls="navbar-nav" />
                <Navbar.Collapse id="navbar-nav">
                    <Nav className="me-auto">
                        {user ? 
                            <>
                            <Nav.Link as={Link} href="/" onClick={() => setExpanded(false)}>Home</Nav.Link>
                            <Nav.Link onClick={() => {handleShowLogout(); setExpanded(false);}}>Log Out</Nav.Link>
                            </> :
                            <>
                            <Nav.Link as={Link} href="/" onClick={() => setExpanded(false)}>Home</Nav.Link>
                            <Nav.Link as={Link} href="/login" onClick={() => setExpanded(false)}>Log In</Nav.Link>
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