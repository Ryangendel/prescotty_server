var changeBusyness = function (event) {
    // event.preventDefault()
    console.log(event)
    if (event.classList.contains("slow")) {
        fetch("/changetaskrouting/admin/busynesscontroller/slow")
            .then(data => data.json())
            .then(cleaned => {
                document.getElementById("currentbusynesslevel").innerHTML = "Slow"
            })
    }
    if (event.classList.contains("slowmedium")) {
        fetch("/changetaskrouting/admin/busynesscontroller/slowmedium")
            .then(data => data.json())
            .then(cleaned => {
                document.getElementById("currentbusynesslevel").innerHTML = "Slow/Medium"
            })
    }
    if (event.classList.contains("medium")) {
        fetch("/changetaskrouting/admin/busynesscontroller/medium")
            .then(data => data.json())
            .then(cleaned => {
                document.getElementById("currentbusynesslevel").innerHTML = "Medium"
            })
    }
    if (event.classList.contains("mediumbusy")) {
        fetch("/changetaskrouting/admin/busynesscontroller/mediumbusy")
            .then(data => data.json())
            .then(cleaned => {
                document.getElementById("currentbusynesslevel").innerHTML = "Medium/Busy"
            })
    }
    if (event.classList.contains("busy")) {
        fetch("/changetaskrouting/admin/busynesscontroller/busy")
            .then(data => data.json())
            .then(cleaned => {
                console.log("changed to busy")

                document.getElementById("currentbusynesslevel").innerHTML = "Busy"
            })
    }

}

window.onload = async function () {

    await fetch("/changetaskrouting/admin/currentbusynesslevel")
        .then(data => data.json())
        .then(cleanedData => {
            const word = cleanedData.busyness_level
            const firstLetter = word.charAt(0)
            const firstLetterCap = firstLetter.toUpperCase()
            const remainingLetters = word.slice(1)
            const capitalizedWord = firstLetterCap + remainingLetters
            document.getElementById("currentbusynesslevel").innerHTML = capitalizedWord
        })
    var buttons = document.getElementsByClassName("quicklink")
    console.log(buttons)
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].onclick = function () {
            changeBusyness(this)
        }
    };
};