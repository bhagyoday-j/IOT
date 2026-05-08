# OpenRouter Integration Checklist ✅

Complete this checklist to successfully integrate OpenRouter API:

---

## Pre-Setup

- [ ] You have Node.js 16+ installed
- [ ] You have npm or yarn package manager
- [ ] You have access to MongoDB (local or cloud)
- [ ] You have internet connection for API calls
- [ ] You have a text editor (VS Code recommended)

---

## Step 1: OpenRouter Setup

- [ ] Visit https://openrouter.ai
- [ ] Create free account (email/social login)
- [ ] Verify email address
- [ ] Go to https://openrouter.ai/keys
- [ ] Create new API key
- [ ] Copy key (starts with `sk-or-v1-`)
- [ ] Save key somewhere safe (not in code!)

---

## Step 2: Backend Configuration

- [ ] Navigate to `backend/` directory
- [ ] Check `.env.example` exists
- [ ] Create new `.env` file (copy from `.env.example`)
- [ ] Add `OPENROUTER_API_KEY=sk-or-v1-xxxxx` to `.env`
- [ ] Update `MONGODB_URI` if needed
- [ ] Update `SITE_URL` (default: http://localhost:5000)
- [ ] Verify `.env` is in `.gitignore` (don't commit!)

---

## Step 3: Install Dependencies

- [ ] Open terminal in `backend/` folder
- [ ] Run: `npm install`
- [ ] Wait for installation to complete
- [ ] Check for errors (should be none)
- [ ] Verify `node_modules` folder was created
- [ ] Check `package-lock.json` was updated

---

## Step 4: Start Backend Server

- [ ] Terminal: `npm run dev`
- [ ] Wait for: `✅ Server running on port 5000`
- [ ] Check for errors in console
- [ ] See database connection status
- [ ] Confirm no "API key not set" warnings (if setup correct)

---

## Step 5: Test Endpoints

### Test 1: Health Check
- [ ] Open new terminal
- [ ] Run: `curl http://localhost:5000/health` (if available)
- [ ] Should return healthy status

### Test 2: Disease Prediction
```bash
curl -X POST http://localhost:5000/api/v1/predictions/disease \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key-for-esp32" \
  -d '{"deviceId":"TEST_001","sensorData":{"temperature":28,"humidity":85,"moisture":75,"ph":6.5}}'
```
- [ ] Request succeeded (200 status)
- [ ] Got disease prediction with AI response
- [ ] Response includes confidence score

### Test 3: Crop Recommendation
```bash
curl -X POST http://localhost:5000/api/v1/predictions/crop \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key-for-esp32" \
  -d '{"deviceId":"TEST_001","conditions":{"temperature":25,"humidity":65,"moisture":50,"ph":6.8,"location":"India"}}'
```
- [ ] Request succeeded
- [ ] Got crop recommendations from AI
- [ ] Includes suitability scores

### Test 4: Farming Advice
```bash
curl -X POST http://localhost:5000/api/v1/predictions/advice \
  -H "Content-Type: application/json" \
  -H "x-api-key: your-secret-api-key-for-esp32" \
  -d '{"deviceId":"TEST_001","sensorData":{"temperature":28,"humidity":70,"moisture":55,"ph":6.5},"cropType":"Tomato"}'
```
- [ ] Request succeeded
- [ ] Got farming advice from AI
- [ ] Includes immediate actions

---

## Step 6: Database Verification

- [ ] MongoDB is running (local or cloud)
- [ ] Connection successful (check console)
- [ ] Collections created in MongoDB
- [ ] At least one prediction saved in database

---

## Step 7: Cost & Usage Setup

- [ ] Checked OpenRouter pricing page
- [ ] Visited account usage page: https://openrouter.ai/account/usage
- [ ] Understood API costs
- [ ] Set up credit card if needed
- [ ] Can view past API calls and costs

---

## Step 8: Production Preparation

- [ ] Reviewed error handling
- [ ] Checked rate limiting
- [ ] Updated API key security (use secrets manager)
- [ ] Tested with actual sensor data (if available)
- [ ] Reviewed logs and monitoring

---

## Step 9: Deployment Ready (Optional)

- [ ] Backend code review completed
- [ ] All tests passing
- [ ] Environment variables secured
- [ ] Database backup strategy planned
- [ ] Monitoring/alerting configured
- [ ] Ready for production deployment

---

## Optional: Advanced Configuration

- [ ] Changed AI model (to gpt-4, Claude, Llama)
- [ ] Adjusted temperature/max_tokens for responses
- [ ] Implemented caching for responses
- [ ] Set up Redis for performance
- [ ] Added request logging
- [ ] Configured backup AI provider

---

## Troubleshooting Checklist

If something doesn't work:

### API Key Issues
- [ ] Verified key starts with `sk-or-v1-`
- [ ] Copied entire key without spaces
- [ ] Key is in `.env` file (not in code)
- [ ] Checked key isn't revoked at openrouter.ai/keys
- [ ] Restarted server after adding key

### Connection Issues
- [ ] Internet connection working
- [ ] Firewall not blocking OpenRouter
- [ ] Proxy configured if required
- [ ] DNS resolving openrouter.ai

### Database Issues
- [ ] MongoDB running
- [ ] Connection string correct
- [ ] Database accessible
- [ ] Username/password correct (if used)

### Server Issues
- [ ] Port 5000 not already in use
- [ ] Node.js version >= 16
- [ ] All dependencies installed
- [ ] No syntax errors in code

---

## Verification Summary

### Before Going Live
- [ ] ✅ API key configured and working
- [ ] ✅ All endpoints tested successfully
- [ ] ✅ Database connection working
- [ ] ✅ Predictions saving correctly
- [ ] ✅ Error handling verified
- [ ] ✅ Cost is within budget
- [ ] ✅ Monitoring set up

### Performance Checks
- [ ] Disease prediction: < 3 seconds
- [ ] Crop recommendation: < 3 seconds
- [ ] Farming advice: < 3 seconds
- [ ] No timeout errors
- [ ] No memory leaks

### Security Checks
- [ ] API key not in code
- [ ] API key not in git history
- [ ] HTTPS used (in production)
- [ ] Rate limiting enabled
- [ ] Input validation working

---

## Documentation Status

- [ ] ✅ Read [OPENROUTER_QUICKSTART.md](backend/OPENROUTER_QUICKSTART.md)
- [ ] ✅ Read [OPENROUTER_SETUP.md](backend/OPENROUTER_SETUP.md)
- [ ] ✅ Read [OPENROUTER_INTEGRATION_SUMMARY.md](OPENROUTER_INTEGRATION_SUMMARY.md)
- [ ] ✅ Read [ESP32_SETUP_GUIDE.md](ESP32_SETUP_GUIDE.md)

---

## Next Steps

After completing this checklist:

1. **Connect Frontend**
   - Update React app to call new endpoints
   - Display AI predictions in UI

2. **Integrate ESP32**
   - Program ESP32 to send sensor data
   - Configure WiFi and backend URL

3. **Monitor Usage**
   - Check OpenRouter dashboard weekly
   - Monitor costs and adjust if needed

4. **Optimize**
   - Implement caching for common predictions
   - Switch models if needed for cost/quality
   - Add request queuing if high load

5. **Scale**
   - Deploy to production
   - Set up load balancer
   - Implement multi-region support

---

## Support Resources

| Resource | Link |
|----------|------|
| OpenRouter Docs | https://openrouter.ai/docs |
| Models List | https://openrouter.ai/models |
| Pricing | https://openrouter.ai/pricing |
| Account Usage | https://openrouter.ai/account/usage |
| Status Page | https://status.openrouter.ai |
| GitHub Issues | [Your Project Repo] |

---

## Sign-Off

When all items above are checked:

- [ ] **Date Completed**: ___________
- [ ] **Checked By**: ___________
- [ ] **Notes**: ___________

---

**Your Smart Agriculture IoT project is now ready with OpenRouter AI! 🎉**

Questions? Check the documentation or OpenRouter support: https://openrouter.ai/docs

