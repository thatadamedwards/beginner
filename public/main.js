let eventBus = new Vue();

Vue.component('product-review', {
    template: `
    <form class="review-form" @submit.prevent="onSubmit">

    <p v-if="errors.length">
        <b>Please correct the following error(s):</b>
        <ul>
            <li v-for="error in errors">{{ error }}</li>
        </ul>
    </p>

    <p>
        <label for="name">Name:</label>
        <input id="name" v-model="name" required>
    </p>
    
    <p>
        <label for="review">Review:</label>
        <textarea id="review" v-model="review"></textarea>
    </p>
    
    <p>
        <label for="rating">Rating</label>
        <select id="rating" v-model.number="rating">
            <option>5</option>
            <option>4</option>
            <option>3</option>
            <option>2</option>
            <option>1</option>
        </select>
    </p>
    
    <p>
        <input type="submit" value="Submit">
    </p>

    </form>
    `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            errors: []
        }
    },
    methods: {
        onSubmit: function () {
            if(this.name && this.rating && this.review) {
                let productReview = {
                name: this.name,
                review: this.review,
                rating: this.rating
            };

            eventBus.$emit('review-submitted', productReview);

            this.name = null;
            this.review = null;
            this.rating = null;
            this.errors = [];
            } else {
                if(!this.name) { this.errors.push("Name Required.")}
                if(!this.review) { this.errors.push("Review Required.")}
                if(!this.rating) { this.errors.push("Rating Required.")}
            }
            
        }
    }
});

Vue.component('product-tabs', {
    props: {
        reviews: Array,
        required: true
    },
    template: `
    <div>
        <span class="tab"
            :class="{ activeTab: selectedTab === tab }"
            v-for="(tab, index) in tabs"
            :key="index"
            @click="selectedTab = tab">
            {{ tab }}
        </span>

        <div v-show="selectedTab === 'Reviews'">
            <h2>Reviews</h2>
            <p v-if="!reviews.length">There are no reviews yet.</p>
            <ul>
                <li v-for="review in reviews">
                    <p>{{ review.name }}</p>
                    <p>{{ review.rating }}</p>
                    <p>{{ review.review }}</p>
                </li>
            </ul>
         </div>

         <product-review v-show="selectedTab === 'Make a Review'"></product-review>

    </div>
    `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review'],
            selectedTab: 'Reviews'
        }
    }
});

Vue.component('product-details', {
    props: {
        details: {
            type: Array,
            required: true
        }
    },
    template: `
      <ul>
        <li v-for="detail in details">{{ detail }}</li>
      </ul>
    `
});

Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        },
        cart: {
            type: Array,
            required: true
        }
    },
    template: `
     <div class="product">
          
        <div class="product-image">
          <img :src="image" />
        </div>
  
        <div class="product-info">
            <h1>{{ product }}</h1>
            <p v-if="inStock">In Stock</p>
            <p v-else>Out of Stock</p>
            <p>Shipping: {{ shipping }}</p>
  
            <product-details :details="details"></product-details>
  
            <div class="color-box"
                 v-for="(variant, index) in variants" 
                 :key="variant.id"
                 :style="{ backgroundColor: variant.color }"
                 @mouseover="updateProduct(index)"
                 >
            </div> 
  
            <button v-on:click="addToCart" 
              :disabled="!inStock"
              :class="{ disabledButton: !inStock }"
              >
            Add to cart
            </button>

            <button v-on:click="removeFromCart" 
            :disabled="!isInCart"
            :class="{ disabledButton: !isInCart }"
            >
          Remove from cart
          </button>
  
         </div>

         <product-tabs :reviews="reviews"></product-tabs>
      
      </div>
     `,
    data() {
        return {
            product: 'Socks',
            brand: 'Vue Mastery',
            selectedVariant: 0,
            details: ['80% cotton', '20% polyester', 'Gender-neutral'],
            variants: [
                {
                    id: 2234,
                    color: 'green',
                    image: 'https://www.vuemastery.com/images/challenges/vmSocks-green-onWhite.jpg',
                    quantity: 10
                },
                {
                    id: 2235,
                    color: 'blue',
                    image: 'https://www.vuemastery.com/images/challenges/vmSocks-blue-onWhite.jpg',
                    quantity: 0
                }
            ],
            reviews: []
        }
    },
    methods: {
        addToCart: function () {
            let selected = this.variants[this.selectedVariant];

            this.$emit('add-to-cart', selected.id);

            if (selected.quantity > 0) {
                selected.quantity -= 1;
            }
        },
        removeFromCart: function () {
            let selected = this.variants[this.selectedVariant];

            if (this.cart.indexOf(selected.id) > -1) {
                selected.quantity += 1;
            }

            this.$emit('remove-from-cart', selected.id);
        },
        updateProduct: function (index) {
            this.selectedVariant = index
        }
    },
    computed: {
        title() {
            return this.brand + ' ' + this.product
        },
        image() {
            return this.variants[this.selectedVariant].image
        },
        inStock() {
            return this.variants[this.selectedVariant].quantity
        },
        isInCart: function () {
            let itemIndex = this.cart.indexOf(this.variants[this.selectedVariant].id);
            return itemIndex > -1;
        },
        shipping() {
            if (this.premium) {
                return "Free"
            }
            return 2.99
        }
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview);
            this.reviews = this.reviews.sort(function(first, second) {
                return second.rating - first.rating;
            });
        });
    }
});

Vue.config.devtools = true;

var app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: []
    },
    methods: {
        addItemToCart(id) {
            this.cart.push(id)
        },
        removeItemFromCart(id) {
            let itemIndex = this.cart.indexOf(id);

            if (itemIndex > -1) {
                this.cart.splice(itemIndex, 1);
            }
        }
    }
});