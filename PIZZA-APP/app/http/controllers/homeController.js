const Menu = require('../../models/menu');

function homeController() {
    //factory function-programming patten
    return {
        //methods
        // crud controllers
        async index(req, res) {
            const pizzas = await Menu.find()


            res.render('home', { pizzas: pizzas })


            // Menu.find().then(function(menus) {
            //     console.log(menus)
            //     res.render('home', { menus: menus });
            // })
        }
    }

}

module.exports = homeController;