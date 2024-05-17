import React from 'react';
import { Divider, Link, Text } from '@chakra-ui/react'
import './Footer.css';

function Footer() {
    return (
        <div className="footer">
            <Divider />
            <Text pt='5px' fontSize='sm'>
                Web App Created by <Link textDecoration="underline" href="https://www.linkedin.com/in/wmccrae" target="_blank" isExternal>Wanda L. McCrae</Link>, Copyright 2024. Code available on <Link textDecoration="underline" href="https://github.com/wlmccrae/headline-editor" target="_blank" isExternal>GitHub</Link>.
            </Text>
        </div>
    )
};

export default Footer;
