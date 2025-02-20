{\rtf1\ansi\ansicpg1254\cocoartf2818
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\paperw11900\paperh16840\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 // SPDX-License-Identifier: MIT\
pragma solidity ^0.8.28;\
\
import "@openzeppelin/contracts/access/Ownable.sol";\
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";\
\
contract UnitsNetwork is Ownable, ReentrancyGuard \{\
    // Yap\uc0\u305 lar\
    struct Station \{\
        address owner;\
        string location;\
        uint256 pricePerKwh;\
        bool isActive;\
        uint256 totalEarnings;\
    \}\
\
    struct ChargingSession \{\
        address user;\
        uint256 stationId;\
        uint256 startTime;\
        uint256 endTime;\
        uint256 energyConsumed;\
        uint256 totalCost;\
        bool isActive;\
    \}\
\
    // Durum De\uc0\u287 i\u351 kenleri\
    mapping(uint256 => Station) public stations;\
    mapping(uint256 => ChargingSession) public chargingSessions;\
    mapping(address => bool) public authorizedStationOwners;\
    \
    uint256 public nextStationId;\
    uint256 public nextSessionId;\
    \
    // \'d6deme ile ilgili de\uc0\u287 i\u351 kenler\
    uint256 public platformFeePercentage = 5; // %5 platform \'fccreti\
    mapping(address => uint256) public userBalances;\
    \
    // Olaylar\
    event StationRegistered(uint256 indexed stationId, address indexed owner, string location);\
    event ChargingStarted(uint256 indexed sessionId, uint256 indexed stationId, address indexed user);\
    event ChargingEnded(uint256 indexed sessionId, uint256 energyConsumed, uint256 totalCost);\
    event PaymentReceived(address indexed user, uint256 amount);\
    event PaymentWithdrawn(address indexed stationOwner, uint256 amount);\
    event FundsDeposited(address indexed user, uint256 amount);\
\
    constructor() Ownable(msg.sender) \{\}\
\
    // \uc0\u304 stasyon y\'f6netimi i\'e7in modifier'lar\
    modifier onlyAuthorizedOwner() \{\
        require(authorizedStationOwners[msg.sender], "Caller is not authorized");\
        _;\
    \}\
\
    modifier validStationId(uint256 stationId) \{\
        require(stations[stationId].owner != address(0), "Station does not exist");\
        _;\
    \}\
\
    // \uc0\u304 stasyon sahibini yetkilendirme\
    function authorizeStationOwner(address owner) external onlyOwner \{\
        require(owner != address(0), "Invalid address");\
        authorizedStationOwners[owner] = true;\
    \}\
\
    // \uc0\u304 stasyon sahibi yetkisini kald\u305 rma\
    function revokeStationOwner(address owner) external onlyOwner \{\
        authorizedStationOwners[owner] = false;\
    \}\
\
    // Yeni istasyon kayd\uc0\u305 \
    function registerStation(\
        string calldata location,\
        uint256 pricePerKwh\
    ) external onlyAuthorizedOwner returns (uint256) \{\
        require(bytes(location).length > 0, "Location cannot be empty");\
        require(pricePerKwh > 0, "Price must be greater than 0");\
\
        uint256 stationId = nextStationId++;\
        \
        stations[stationId] = Station(\{\
            owner: msg.sender,\
            location: location,\
            pricePerKwh: pricePerKwh,\
            isActive: true,\
            totalEarnings: 0\
        \});\
\
        emit StationRegistered(stationId, msg.sender, location);\
        return stationId;\
    \}\
\
    // \uc0\u304 stasyon bilgilerini g\'fcncelleme\
    function updateStation(\
        uint256 stationId,\
        string calldata newLocation,\
        uint256 newPricePerKwh\
    ) external validStationId(stationId) \{\
        Station storage station = stations[stationId];\
        require(msg.sender == station.owner, "Only station owner can update");\
        require(bytes(newLocation).length > 0, "Location cannot be empty");\
        require(newPricePerKwh > 0, "Price must be greater than 0");\
\
        station.location = newLocation;\
        station.pricePerKwh = newPricePerKwh;\
    \}\
\
    // \uc0\u304 stasyonu aktif/pasif yapma\
    function toggleStationStatus(uint256 stationId) \
        external \
        validStationId(stationId) \
    \{\
        Station storage station = stations[stationId];\
        require(msg.sender == station.owner, "Only station owner can toggle status");\
        \
        station.isActive = !station.isActive;\
    \}\
\
    // \uc0\u304 stasyon bilgilerini g\'f6r\'fcnt\'fcleme\
    function getStation(uint256 stationId) \
        external \
        view \
        validStationId(stationId) \
        returns (\
            address owner,\
            string memory location,\
            uint256 pricePerKwh,\
            bool isActive,\
            uint256 totalEarnings\
        ) \
    \{\
        Station storage station = stations[stationId];\
        return (\
            station.owner,\
            station.location,\
            station.pricePerKwh,\
            station.isActive,\
            station.totalEarnings\
        );\
    \}\
\
    // \uc0\u304 stasyon kay\u305 t fonksiyonlar\u305  buraya gelecek\
    \
    // Kimlik do\uc0\u287 rulama fonksiyonlar\u305  buraya gelecek\
    \
    // Para yat\uc0\u305 rma fonksiyonu\
    function depositFunds() external payable \{\
        userBalances[msg.sender] += msg.value;\
        emit FundsDeposited(msg.sender, msg.value);\
    \}\
\
    // \uc0\u350 arj ba\u351 latma\
    function startCharging(uint256 stationId) \
        external \
        validStationId(stationId) \
        nonReentrant \
        returns (uint256) \
    \{\
        Station storage station = stations[stationId];\
        require(station.isActive, "Station is not active");\
        \
        uint256 sessionId = nextSessionId++;\
        ChargingSession storage session = chargingSessions[sessionId];\
        \
        session.user = msg.sender;\
        session.stationId = stationId;\
        session.startTime = block.timestamp;\
        session.isActive = true;\
        \
        emit ChargingStarted(sessionId, stationId, msg.sender);\
        return sessionId;\
    \}\
\
    // \uc0\u350 arj sonland\u305 rma ve \'f6deme\
    function endCharging(\
        uint256 sessionId, \
        uint256 energyConsumed\
    ) external nonReentrant \{\
        ChargingSession storage session = chargingSessions[sessionId];\
        require(session.isActive, "Session is not active");\
        require(session.user == msg.sender, "Not session owner");\
        \
        Station storage station = stations[session.stationId];\
        \
        // \'dccret hesaplama\
        uint256 totalCost = (energyConsumed * station.pricePerKwh) / 1e18;\
        require(userBalances[msg.sender] >= totalCost, "Insufficient balance");\
        \
        // Platform \'fccreti hesaplama\
        uint256 platformFee = (totalCost * platformFeePercentage) / 100;\
        uint256 stationOwnerAmount = totalCost - platformFee;\
        \
        // Bakiye g\'fcncelleme\
        userBalances[msg.sender] -= totalCost;\
        station.totalEarnings += stationOwnerAmount;\
        \
        // Oturum g\'fcncelleme\
        session.endTime = block.timestamp;\
        session.energyConsumed = energyConsumed;\
        session.totalCost = totalCost;\
        session.isActive = false;\
        \
        emit ChargingEnded(sessionId, energyConsumed, totalCost);\
    \}\
\
    // \uc0\u304 stasyon sahibi i\'e7in kazan\'e7 \'e7ekme\
    function withdrawEarnings(uint256 stationId) \
        external \
        validStationId(stationId) \
        nonReentrant \
    \{\
        Station storage station = stations[stationId];\
        require(msg.sender == station.owner, "Only station owner can withdraw");\
        require(station.totalEarnings > 0, "No earnings to withdraw");\
        \
        uint256 amount = station.totalEarnings;\
        station.totalEarnings = 0;\
        \
        (bool success, ) = payable(station.owner).call\{value: amount\}("");\
        require(success, "Transfer failed");\
        \
        emit PaymentWithdrawn(station.owner, amount);\
    \}\
\
    // Aktif \uc0\u351 arj oturumu kontrol\'fc\
    function getActiveSession(uint256 sessionId) \
        external \
        view \
        returns (\
            address user,\
            uint256 stationId,\
            uint256 startTime,\
            bool isActive\
        ) \
    \{\
        ChargingSession storage session = chargingSessions[sessionId];\
        return (\
            session.user,\
            session.stationId,\
            session.startTime,\
            session.isActive\
        );\
    \}\
\
    // Kullan\uc0\u305 c\u305  bakiyesi g\'f6r\'fcnt\'fcleme\
    function getBalance() external view returns (uint256) \{\
        return userBalances[msg.sender];\
    \}\
\}\
\
}
