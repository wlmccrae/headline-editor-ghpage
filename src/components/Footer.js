import React from 'react';
import { Divider, Link, Text } from '@chakra-ui/react'
import './Footer.css';

function Footer() {
    return (
        <div className="footer">
            <Divider />
            <Text pt='5px' fontSize='sm'>
                Designed by <Link textDecoration="underline" href="https://wandamccrae.com/" target="_blank" rel= "noopener noreferrer" isExternal>Wanda L. McCrae</Link>, Copyright 2024-2025.
            </Text>
        </div>
    )
};

export default Footer;
