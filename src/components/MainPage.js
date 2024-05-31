import React, {useState} from 'react';
import SearchResults from "./SearchResults";
import {
    Heading,
    Center,
    Stack,
    Input, InputGroup, InputLeftAddon,
    Button, Divider,
    Card, CardHeader, CardBody, CardFooter,
    Alert, AlertIcon } from '@chakra-ui/react'
import './MainPage.css';

function MainPage() {
    const [copyright, setCopyright] = useState('');
    const [resultsLoaded, setResultsLoaded] = useState(false);
    const [articleList, setarticleList] = useState([]);
    const [archiveFormData, setArchiveFormData] = useState({
        month: 0,
        year: 0,
    });
    const [formDate, setFormDate] = useState({month: 0, year: 0,});
    const [yearError, setYearError] = useState(false);
    const [yearErrorMessage, setYearErrorMessage] = useState("");
    const [monthError, setMonthError] = useState(false);
    const [monthErrorMessage, setMonthErrorMessage] = useState('');
    const [formatError, setFormatError] = useState(false);
    const [formatErrorMessage, setFormatErrorMessage] = useState('');

    const API_KEY = process.env.REACT_APP_NYT_API_KEY;

    // Handle when the form changes
    const handleChange = (event) => {
        setArchiveFormData({
            ...archiveFormData,
            [event.target.name]: event.target.value
        });
    };

    // Handle the reset page button.
    const resetPage = async(event) => {
        event.preventDefault();
        setResultsLoaded(false);
        setYearError(false);
        setYearErrorMessage("");
        setMonthError(false);
        setMonthErrorMessage('');
        setFormatError(false);
        setFormatErrorMessage('');
    };

    // Handle the search button.
    const fetchArchive = async (event) => {
        const archiveURL = `https://corsproxy.io/?https://api.nytimes.com/svc/archive/v1/${archiveFormData.year}/${archiveFormData.month}.json?api-key=${API_KEY}`;
        event.preventDefault();
        setResultsLoaded(false);
        setFormDate(archiveFormData);

        const currentYear = new Date().getFullYear();
        let currentMonth = new Date().getMonth();
        currentMonth++;  // Increase by one, as the Date object has Jan = 0.
        const formMonth = parseInt(archiveFormData.month);
        const formYear = parseInt(archiveFormData.year);

        if (!Number.isInteger(formYear) || !Number.isInteger(formMonth)) {
            setFormatError(true);
            setFormatErrorMessage('Enter the year as 4 digits (YYYY) and the month as a number between 1 and 12');
        } else if (formYear < 1851 || formYear > currentYear) {
            setYearError(true);
            setYearErrorMessage(`Enter a year between 1851 and ${currentYear}.`);
        } else if ((formYear < currentYear) && (formMonth > 12)) {
            setMonthError(true);
            setMonthErrorMessage('Enter a month between 1 and 12.');
        } else if (formYear === currentYear && (formMonth > currentMonth)) {
            setMonthError(true);
            setMonthErrorMessage(`Enter a month between 1 and ${currentMonth}.`);
        } else {
            const archiveResponse = await fetch(archiveURL);
            if (archiveResponse.ok) {
                const archiveData = await archiveResponse.json();
                // console.log(`***** Archive Data ==> ${JSON.stringify(archiveData)}`);
                setCopyright(archiveData.copyright);
                setResultsLoaded(true);
                setarticleList(archiveData.response.docs);
                setYearError(false);
                setYearErrorMessage("");
                setMonthError(false);
                setMonthErrorMessage('');
                setFormatError(false);
                setFormatErrorMessage('');
            } else {
                window.confirm("There was a problem fetching the NY Times archive.")
            };
        };
        // console.log(`***** Copyright: ${copyright}`);
        // console.log(`***** Article Info: ${JSON.stringify(articleList)}`);
        // console.log(`***** Component Status: ${resultsLoaded}`);
    };

    // Handle the search archive button.
    // const searchArchive = async (event) => {
    //     const searchURL = `https://api.nytimes.com/svc/search/v2/articlesearch.json?q=election&api-key=${API_KEY}`;
    //     event.preventDefault();

    //     const archiveResponse = await fetch(searchURL);
    //     if (archiveResponse.ok) {
    //         const archiveData = await archiveResponse.json();
    //         console.log(`***** Search Archive Data ==> ${JSON.stringify(archiveData)}`);

    //     } else {
    //         window.confirm("There was a problem searching the NY Times archive.")
    //     }
    // };

    // Handle the Top Stories button.
    // const fetchTopStories = async (event) => {
    //     event.preventDefault();

    //     const archiveResponse = await fetch(topStoriesURL);
    //     if (archiveResponse.ok) {
    //         const archiveData = await archiveResponse.json();
    //         console.log(`***** Top Stories Data ==> ${JSON.stringify(archiveData)}`);

    //     } else {
    //         window.confirm("There was a problem fetching the NY Times Top Stories.")
    //     }
    // };

    const freshLanding = () => (
        <div className="initialdisplay">
            <h2>No results yet.</h2>
        </div>
    );

    return (
        <div className="content">
            <div className="searches">
                <Center><Heading size='xl' marginBottom='10px' color="brand.100">Headline Editor</Heading></Center>
                <Card bg="brand.200" className="search-card" width='400px' boxShadow='lg' border='1px' borderColor='gray.100'>
                    <CardHeader>
                        <Heading size='sm' color="brand.100">Retrieve all articles for any month between 1851 and now.</Heading>
                    </CardHeader>
                    <CardBody>
                        <form id='archive-form'>
                            <Stack spacing={1}>
                                <InputGroup>
                                    <InputLeftAddon w='120px' color="brand.100">Year (YYYY)</InputLeftAddon>
                                    <Input onChange={handleChange} type="text" id="year" name="year" placeholder="2024" variant='outline' width='100px' bg="brand.300"/>
                                </InputGroup>
                                <InputGroup>
                                    <InputLeftAddon w='120px' color="brand.100">Month (M)</InputLeftAddon>
                                    <Input onChange={handleChange} type="text" id="month" name="month" placeholder="5" variant='outline' width='100px' bg="brand.300"/>
                                </InputGroup>
                            </Stack>
                        </form>
                    </CardBody>
                    <Divider color="brand.200" />
                    <CardFooter>
                        <Stack spacing={2} direction='row' align='center'>
                            <Button onClick={fetchArchive} className="button" size='sm' color="brand.300" bg="brand.100">Search</Button>
                            <Button onClick={resetPage} className="button" size='sm' color="brand.100" bg="brand.300">Reset Page</Button>
                        </Stack>
                    </CardFooter>
                    { yearError  &&
                        <Alert status='error'>
                            <AlertIcon />
                            { yearErrorMessage }
                        </Alert>
                    }
                    { monthError  &&
                        <Alert status='error'>
                            <AlertIcon />
                            { monthErrorMessage }
                        </Alert>
                    }
                    { formatError &&
                        <Alert status='error'>
                            <AlertIcon />
                            { formatErrorMessage }
                        </Alert>
                    }
                </Card>
            </div>
            <div className="results">
                {resultsLoaded ? <SearchResults formData={formDate} articleData={articleList} copyright={copyright} /> : freshLanding()}
            </div>
        </div>

    );

};

export default MainPage;
