import React, {useState} from 'react';
import SearchResults from "./SearchResults";
import { useDyslexia } from '../DyslexiaContext';
import {
    Heading,
    Center,
    Stack,
    Input, InputGroup, InputLeftAddon,
    Button, Divider, Text,
    Card, CardHeader, CardBody, CardFooter,
    Alert, AlertIcon,
    Select, Switch, FormControl, FormLabel } from '@chakra-ui/react'
import './MainPage.css';

function organizeData(rawData) {
    const organizedData = {};
    // For every article in the list
        // Check the publication date: year, month, and date.
        // If that pub date is not in the object, add it.
        // Else add that article's metadata to the existing pub date list.
    return organizedData;
};

function MainPage() {
    const { dyslexiaMode, setDyslexiaMode } = useDyslexia();
    const [copyright, setCopyright] = useState('');
    const [resultsLoaded, setResultsLoaded] = useState(false);
    const [articleList, setarticleList] = useState([]);
    const [archiveFormData, setArchiveFormData] = useState({
        month: "",
        year: 0,
    });
    const [formDate, setFormDate] = useState({month: "", year: 0,});
    const [yearError, setYearError] = useState(false);
    const [yearErrorMessage, setYearErrorMessage] = useState("");
    const [monthError, setMonthError] = useState(false);
    const [monthErrorMessage, setMonthErrorMessage] = useState('');
    const [formatError, setFormatError] = useState(false);
    const [formatErrorMessage, setFormatErrorMessage] = useState('');
    const [fetchError, setFetchError] = useState(false);
    const [isSearching, setIsSearching] = useState(false);

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

    // Handle when the form changes
    const handleChange = (event) => {
        setArchiveFormData({
            ...archiveFormData,
            [event.target.name]: event.target.value
        });
    };

    // Handle the clear button.
    const resetPage = async(event) => {
        event.preventDefault();
        setResultsLoaded(false);
        setIsSearching(false);
        setYearError(false);
        setYearErrorMessage("");
        setMonthError(false);
        setMonthErrorMessage('');
        setFormatError(false);
        setFormatErrorMessage('');
        setFetchError(false);
    };

    // Handle the search button.
    const fetchArchive = async (event) => {
        const archiveURL = `${BACKEND_URL}/nyt?year=${archiveFormData.year}&month=${archiveFormData.month}`;
        event.preventDefault();
        setResultsLoaded(false);
        setIsSearching(false);
        setFormDate(archiveFormData);

        const currentYear = new Date().getFullYear();
        let currentMonth = new Date().getMonth();
        currentMonth++;  // Increase by one, as the Date object has Jan = 0.
        const yearRegex = /^\d{4}$/;

        if (!yearRegex.test(archiveFormData.year) || !archiveFormData.month) {
            setFormatError(true);
            setFormatErrorMessage('Enter the year as 4 digits (YYYY) and select a month.');
            return;
        }

        const formYear = parseInt(archiveFormData.year, 10);
        const formMonth = parseInt(archiveFormData.month, 10);

        if (formYear < 1851 || formYear > currentYear) {
            setYearError(true);
            setYearErrorMessage(`Enter a year between 1851 and ${currentYear}.`);
        } else if (formYear === currentYear && (formMonth < 1 || formMonth > currentMonth)) {
            setMonthError(true);
            setMonthErrorMessage(`Enter a month between 1 and ${currentMonth}.`);
        } else {
            setIsSearching(true);
            try {
                const archiveResponse = await fetch(archiveURL);
                setIsSearching(false);
                if (archiveResponse.ok) {
                    const archiveData = await archiveResponse.json();
                    setCopyright(archiveData.copyright);
                    setResultsLoaded(true);
                    setarticleList(archiveData.response.docs);
                    setYearError(false);
                    setYearErrorMessage("");
                    setMonthError(false);
                    setMonthErrorMessage('');
                    setFormatError(false);
                    setFormatErrorMessage('');
                    setFetchError(false);
                } else {
                    setFetchError(true);
                }
            } catch {
                setIsSearching(false);
                setFetchError(true);
            }
        };
    };

    return (
        <main id="main-content" className="content">
            <div className="searches">
                <Center><Heading as='h1' size='xl' color="brand.100">Headline Editor</Heading></Center>
                <Center><Text fontSize='xl' marginBottom='8px' color="brand.100" textAlign='center'>Play with NY Times Headlines from the Archives</Text></Center>
                <Center marginBottom='12px'>
                    <FormControl display='flex' alignItems='center' width='auto'>
                        <Switch
                            id='dyslexia-mode'
                            isChecked={dyslexiaMode}
                            onChange={() => setDyslexiaMode(!dyslexiaMode)}
                            size='sm'
                            colorScheme='blue'
                        />
                        <FormLabel htmlFor='dyslexia-mode' mb='0' ml='2' fontSize='sm' fontWeight='normal' cursor='pointer' color="brand.100">
                            Dyslexia-friendly mode
                        </FormLabel>
                    </FormControl>
                </Center>
                <Card bg="brand.200" className="search-card" width={['95%', '400px']} maxWidth='400px' boxShadow='lg' border='1px' borderColor='gray.100'>
                    <CardHeader>
                        <Text color="brand.100">Retrieve all articles for any month between 1851 and now. If the current year/month does not work&mdash;recent content can be restricted&mdash;try earlier dates.</Text>
                    </CardHeader>
                    <CardBody>
                        <form id='archive-form' aria-label="Search NY Times archive">
                            <Stack spacing={1}>
                                <InputGroup>
                                    <InputLeftAddon w='140px' color="brand.100" aria-hidden="true">Year (YYYY)</InputLeftAddon>
                                    <Input onChange={handleChange} type="text" id="year" name="year" placeholder="2024" variant='outline' w='100px' bg="brand.300" aria-label="Year, 4 digits (YYYY)"/>
                                </InputGroup>
                                <InputGroup>
                                    <InputLeftAddon w='140px' color="brand.100" aria-hidden="true">Month</InputLeftAddon>
                                    <Select onChange={handleChange} id="month" name="month" aria-label="Month" placeholder='Select month' borderLeftRadius='0' bg="brand.300" size='md'>
                                        <option value="1">January</option>
                                        <option value="2">February</option>
                                        <option value="3">March</option>
                                        <option value="4">April</option>
                                        <option value="5">May</option>
                                        <option value="6">June</option>
                                        <option value="7">July</option>
                                        <option value="8">August</option>
                                        <option value="9">September</option>
                                        <option value="10">October</option>
                                        <option value="11">November</option>
                                        <option value="12">December</option>
                                    </Select>
                                </InputGroup>
                            </Stack>
                        </form>
                    </CardBody>
                    <Divider color="brand.200" />
                    <CardFooter>
                        <Stack spacing={2} direction='row' align='center'>
                            <Button type="button" onClick={fetchArchive} className="button" size='sm' color="brand.300" bg="brand.100">Search</Button>
                            <Button type="button" onClick={resetPage} className="button" size='sm' color="brand.100" bg="brand.300">Clear</Button>
                        </Stack>
                    </CardFooter>
                    { yearError  &&
                        <Alert aria-atomic="true" status='error'>
                            <AlertIcon />
                            { yearErrorMessage }
                        </Alert>
                    }
                    { monthError  &&
                        <Alert aria-atomic="true" status='error'>
                            <AlertIcon />
                            { monthErrorMessage }
                        </Alert>
                    }
                    { formatError &&
                        <Alert aria-atomic="true" status='error'>
                            <AlertIcon />
                            { formatErrorMessage }
                        </Alert>
                    }
                    { fetchError &&
                        <Alert aria-atomic="true" status='error'>
                            <AlertIcon />
                            There was a problem fetching the NY Times archive.
                        </Alert>
                    }
                </Card>
            </div>
            <div className="results" aria-live="polite">
                {resultsLoaded
                    ? articleList.length === 0
                        ? <div className="initialdisplay"><Text color="brand.100">No articles were found for this date. Try a different month or year.</Text></div>
                        : <SearchResults formData={formDate} articleData={articleList} copyright={copyright} />
                    : isSearching
                        ? <div className="initialdisplay"><Heading as='h2' size='md' color="brand.100">Searching...</Heading></div>
                        : null}
            </div>
        </main>

    );

};

export default MainPage;
