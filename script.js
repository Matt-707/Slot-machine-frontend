import { contractAddress, abi } from "./constants.js"
import {ethers} from "./ethers-5.1.esm.min.js"

let provider;
let signer;
let contract;
let intervalIDs = [];
const fruits = ["🍒", "🍋", "🍉", "🍇", "🍊", "🍓", "🍍", "🍌", "🍑", "🍈"];


document.getElementById("connectButton").addEventListener("click", async () => {
    if (typeof (window.ethereum) !== "undefined") {
        try {
            await ethereum.request({ method: 'eth_requestAccounts' });
            provider = new ethers.providers.Web3Provider(window.ethereum);
            signer = provider.getSigner();
            contract = new ethers.Contract(contractAddress, abi, signer);

            document.getElementById("connectButton").textContent = "Connected";
            document.getElementById("gameSection").classList.remove("hidden");
            document.getElementById("enterButton").disabled = false;
            initialSlotState();
            //await displayBalance();

        } catch (error) {
            console.error("Error connecting to wallet:", error);
        }
    }
});

async function displayBalance() {
    try {
        const balance = await contract.checkPlayerBalance();
        const formattedBalance = ethers.utils.formatEther(balance)
        console.log("Balance:", formattedBalance);
        document.getElementById("balance").textContent = formattedBalance;
    } catch (error) {
        console.error("Error getting balance:", error);
        document.getElementById("balance").textContent = "Error";
    }
}

document.getElementById("enterButton").addEventListener("click", async () => {
    const ETHAmount = document.getElementById("ETHAmount").value
    try {
        const tx = await contract.enterSlots({ value: ethers.utils.parseEther(ETHAmount) });
        await tx.wait();
        await displayBalance();
        document.getElementById("spinButton").disabled = false;
        document.getElementById("exitButton").disabled = false;
        document.getElementById("increaseDepositButton").disabled = false;
        document.getElementById("enterButton").disabled = true;
        document.getElementById("ETHAmount").placeholder = "Deposit Amount";
    } catch (error) {
        console.error("Error entering the game:", error);
    }
});

document.getElementById("spinButton").addEventListener("click", async () => {
    try {		
        startSlotAnimation();
        const tx = await contract.spin();
		await tx.wait();
        
        //await delay(4000);
        await updateSlotValues();
        await displayBalance();
    } catch (error) {
        console.error("Error spinning the slots:", error);
    }
});

document.getElementById("exitButton").addEventListener("click", async () => {
    try {
        //we need to change this to the name of the function in the ABI
        const tx = await contract.exit();
        await tx.wait();
        await displayBalance();
        document.getElementById("spinButton").disabled = true;
        document.getElementById("exitButton").disabled = true;
        document.getElementById("increaseDepositButton").disabled = true;
        document.getElementById("enterButton").disabled = false;
        document.getElementById("ETHAmount").placeholder = "Minimum 0.005 ETH to enter";
    } catch (error) {
        console.error("Error exiting the game:", error);
    }
});

document.getElementById("increaseDepositButton").addEventListener("click", async () => {
    const ETHAmount = document.getElementById("ETHAmount").value
    try {
        const tx = await contract.increaseDeposit({ value: ethers.utils.parseEther(ETHAmount) });
        await tx.wait();
        await displayBalance();
    } catch (error) {
        console.error("Error increasing deposit:", error);
    }
});

function startSlotAnimation() {
    const slots = document.querySelectorAll(".slot");
    clearIntervalSlots();

    slots.forEach((slot, index) => {
        slot.textContent = ""; // Clear content for animation
        const intervalID = setInterval(() => {
            const randomNumber = Math.floor(Math.random() * 10);
            slot.textContent = fruits[randomNumber];
        }, 100);
        intervalIDs.push(intervalID);
    });
}

function clearIntervalSlots() {
    intervalIDs.forEach(id => clearInterval(id));
    intervalIDs = []; // Reset the interval IDs array
}

async function updateSlotValues() {
    try {
        const slotValues = await contract.getRecentSlotCombo();
        stopSlotAnimation(slotValues);
    } catch (error) {
        console.error("Error fetching slot values:", error);
        stopSlotAnimation([0, 0, 0]); // Fallback to 0s in case of error
    }
}

function stopSlotAnimation(slotValues) {
    const slots = document.querySelectorAll(".slot");
    slots.forEach((slot, index) => {
        clearInterval(intervalIDs[index]);
        const fruitIndex = slotValues[index]
        slot.textContent = fruits[fruitIndex]; // Set content to slot values
    });
}

function initialSlotState() {
    const slots = document.querySelectorAll(".slot");
    slots.forEach((slot, index) => {
        //clearInterval(intervalID)
        slot.textContent = fruits[0]; // Set content to slot values
    });
}


