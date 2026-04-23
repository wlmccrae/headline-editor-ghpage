import React from 'react';
import { Divider, Link, Text } from '@chakra-ui/react'
import './Footer.css';

function Footer() {
    return (
        <footer className="footer">
            <Divider />
            <Text pt='5px' fontSize='sm'>
                Designed by <Link textDecoration="underline" href="https://wandamccrae.com/" target="_blank" rel="noopener noreferrer" isExternal aria-label="Visit Wanda L. McCrae's website, opens in new tab">Wanda L. McCrae</Link>, Copyright 2024-2026.
            </Text>
        </footer>
    )
};

export default Footer;
