"use client";

import { useState } from "react";
import { Box, Tabs, Tab, Snackbar, Alert } from "@mui/material";
import GameReviewTab from "./GameReviewTab";
import ListedGamesTab from "./ListedGamesTab";
import UsersTab from "./UsersTab";
import TagsManagerTab from "./TagsManagerTab";

export default function AdminTabs() {
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };


  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="admin dashboard tabs">
          <Tab label="审核发布" id="tab-0" aria-controls="tabpanel-0" />
          <Tab label="游戏列表" id="tab-1" aria-controls="tabpanel-1" />
          <Tab label="用户列表" id="tab-2" aria-controls="tabpanel-2" />
          <Tab label="Tags管理" id="tab-3" aria-controls="tabpanel-3" />
        </Tabs>
      </Box>
      
      <TabPanel value={value} index={0}>
        <GameReviewTab setSnackbar={setSnackbar}/>
      </TabPanel>
      
      <TabPanel value={value} index={1}>
        <ListedGamesTab setSnackbar={setSnackbar}/>
      </TabPanel>
      
      <TabPanel value={value} index={2}>
        <UsersTab setSnackbar={setSnackbar} />
      </TabPanel>

      <TabPanel value={value} index={3}>
        <TagsManagerTab setSnackbar={setSnackbar} />
      </TabPanel>

      <Snackbar open={snackbar.open} autoHideDuration={6000}  onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// Tab Panel Component
function TabPanel({ children, value, index }: { children: React.ReactNode; value: number; index: number }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      className="p-4"
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}