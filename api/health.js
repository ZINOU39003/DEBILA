module.exports = (req, res) => {
  res.json({ 
    success: true, 
    status: "ok", 
    message: "Bader Standalone Health Check working!",
    timestamp: new Date().toISOString()
  });
};
