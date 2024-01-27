import React, { useState, useEffect } from "react";
import {
  Container,
  Select,
  Chip,
  Dialog,
  MenuItem,
  List,
  ListItem,
  Avatar,
  ListItemText,
  ListItemAvatar,
  Typography,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  Box,
} from "@material-ui/core";
import languagesData from "./languages.json";

const App = () => {
  const [inputData, setInputData] = useState({
    projectType: "",
    difficulty: "easy",
    popularity: "low",
    preferredLanguage: "",
  });

  const [projectTypes, setProjectTypes] = useState([]);
  const [preferredLanguages, setPreferredLanguages] = useState([]);
  const [recommendedLanguages, setRecommendedLanguages] = useState([]);

  const appStyle = {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  };
  const containerStyle = {
    backgroundColor: "#ffffff",
    border: "2px solid #000000",
    borderRadius: "10px",
    maxWidth: "600px",
  };

  useEffect(() => {
    const types = new Set();
    languagesData.languages.forEach((lang) => {
      lang.usage.forEach((type) => types.add(type));
    });
    setProjectTypes(Array.from(types));
  }, []);

  useEffect(() => {
    if (inputData.projectType) {
      const filteredLanguages = languagesData.languages.filter((lang) =>
        lang.usage.includes(inputData.projectType)
      );
      setPreferredLanguages(filteredLanguages);
    }
  }, [inputData.projectType]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInputData({ ...inputData, [name]: value });
  };

  const getDifficultyScore = (difficulty) => {
    const difficultyScores = {
      easy: 0.3,
      medium: 0.6,
      hard: 1.0,
    };
    return difficultyScores[difficulty];
  };

  const getPopularityScore = (popularity) => {
    const popularityScores = {
      low: 0.3,
      medium: 0.6,
      high: 1.0,
    };
    return popularityScores[popularity];
  };

  const calculateScores = () => {
    let filteredLanguages = preferredLanguages;

    // Dodajemy punkty za usability
    filteredLanguages = filteredLanguages.map((lang) => {
      let score = lang.usability[inputData.projectType] * 20;

      // Dodajemy punkty za trudność i popularność
      const difficultyScore = getDifficultyScore(inputData.difficulty);
      score += 10 - Math.abs(lang.difficulty - difficultyScore) * 10;

      const popularityScore = getPopularityScore(inputData.popularity);
      score += 10 - Math.abs(lang.popularity - popularityScore) * 10;

      // Dodatkowe punkty dla preferowanego języka, pomnożone przez usability
      if (lang.name === inputData.preferredLanguage) {
        score += lang.usability[inputData.projectType] * 15;
      }

      // Dodatkowe punkty za biblioteki
      score += lang.libraries * 5;

      return { ...lang, score };
    });

    // Sortowanie i wybór trzech najlepszych języków
    return filteredLanguages.sort((a, b) => b.score - a.score).slice(0, 3);
  };

  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleRecommendLanguages = (e) => {
    e.preventDefault();
    setLoading(true);
    setDialogOpen(true);
    setIsProcessing(true);

    // Symulacja opóźnienia
    setTimeout(() => {
      setIsProcessing(false);
      const topLanguages = calculateScores();
      setRecommendedLanguages(topLanguages);
      setLoading(false);
    }, 2000); // 2 sekundy opóźnienia
  };

  return (
    <div style={appStyle}>
      <Container maxWidth="sm" style={containerStyle}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          my={4}
        >
          <h2>Find best language for your preferences!</h2>
          <form onSubmit={handleRecommendLanguages} style={{ width: "100%" }}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Project Type</InputLabel>
              <Select
                name="projectType"
                value={inputData.projectType}
                onChange={handleInputChange}
              >
                {projectTypes.map((type) => (
                  <MenuItem
                    key={type}
                    value={type}
                    style={{ textTransform: "capitalize" }}
                  >
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Language difficulty</InputLabel>
              <Select
                name="difficulty"
                value={inputData.difficulty}
                onChange={handleInputChange}
              >
                <MenuItem value="easy">Easy</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="hard">Hard</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth margin="normal">
              <InputLabel>Popularity</InputLabel>
              <Select
                name="popularity"
                value={inputData.popularity}
                onChange={handleInputChange}
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>

            {preferredLanguages.length > 0 && (
              <FormControl fullWidth margin="normal">
                <InputLabel>Preffered language</InputLabel>
                <Select
                  name="preferredLanguage"
                  value={inputData.preferredLanguage}
                  onChange={handleInputChange}
                >
                  {preferredLanguages.map((lang) => (
                    <MenuItem key={lang.name} value={lang.name}>
                      {lang.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <Button type="submit" variant="contained" color="primary" fullWidth>
              Calculate
            </Button>
          </form>
        </Box>
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <Box
            p={2}
            style={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {loading && isProcessing ? (
              <div style={{ width: "100%", margin: "50px" }}>
                <CircularProgress size={80} />
                <Typography variant="h6">Processing..</Typography>
              </div>
            ) : (
              <div style={{ width: "100%", margin: "50px" }}>
                <Typography variant="h5">Recommended Languages</Typography>
                <List>
                  {recommendedLanguages.map((lang, index) => (
                    <div
                      key={lang.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "column",
                        marginBottom: "20px",
                        animation: `fadeIn 0.5s ease ${index * 0.5}s forwards`,
                        opacity: 0,
                      }}
                    >
                      <ListItem alignItems="center">
                        <ListItemAvatar>
                          <Avatar alt={lang.name} src={lang.logo} />
                        </ListItemAvatar>
                        <ListItemText
                          primary={lang.name}
                          secondary={`Score: ${lang.score.toFixed(2)}`}
                        />
                      </ListItem>
                      <Typography variant="body2" style={{ fontSize: "14px" }}>
                        {lang.difficulty < 0.4 && (
                          <Chip
                            label="Easy"
                            color="secondary"
                            style={{ margin: "2px" }}
                          />
                        )}
                        {lang.popularity > 0.5 && (
                          <Chip
                            label="Popular"
                            color="primary"
                            style={{ margin: "2px" }}
                          />
                        )}
                        {lang.libraries > 0.5 && (
                          <Chip
                            label="Many libraries"
                            color="primary"
                            style={{ margin: "2px" }}
                          />
                        )}
                        {Object.keys(lang.usability)
                          .filter((key) => lang.usability[key] > 0.6)
                          .map((key) => (
                            <Chip
                              key={key}
                              label={key}
                              color="primary"
                              style={{
                                margin: "2px",
                                backgroundColor: "#4CAF50",
                              }}
                            />
                          ))}
                      </Typography>
                    </div>
                  ))}
                </List>
              </div>
            )}
          </Box>
        </Dialog>
      </Container>
    </div>
  );
};

export default App;
