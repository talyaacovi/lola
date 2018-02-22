import threading
# import time
from ig import *


# create a condition object
condition = threading.Condition()


def instagram_function(restaurant):

    print restaurant

    ig_loc_id = get_instagram_location(restaurant.rest_id, restaurant.name,
                                       restaurant.lat, restaurant.lng,
                                       restaurant.address, restaurant.city)
    print ig_loc_id

    restaurant.ig_loc_id = ig_loc_id

    successMsg = get_instagram_photos(restaurant.rest_id, ig_loc_id)

    print successMsg


# define a function or class that will be the entry point for your "Consumer"
# create a function for the thread
class Instagram(threading.Thread):
    """Consumes restaurant information from list to get IG info.

    data needed to get IG location ID:
        rest_name
        rest_lat
        rest_lng
        rest_address
        rest_city

    """

    # def __init__(self, restaurants, condition):
    def __init__(self, restaurant):
        """Constructor, list of restaurants, condition synchronization object."""

        threading.Thread.__init__(self)
        # self.restaurants = restaurants
        # self.condition = condition

        self.restaurant = restaurant

    def run(self):
        """Thread run method. Gets restaurants from list."""
        print 'in my instagram worker run method!!!!!!!!'
        # once new restaurant has been added to DB, Consumer gets that Restaurant
        # object from the list, then uses the info to get the Instagram location
        # ID, then uses the Instagram location ID to get the photos
        # finally, needs to update record in Restaurants table with the Instagram location
        # ID and create new records in Photos table with URLs

        # self.condition.acquire()
        # while True:
        #     if self.restaurants:
        #         restaurant = self.restaurants.pop()
        #         break
        #     self.condition.wait()
        # self.condition.release()

# start a thread for the function / class you defined and pass it the condition you created earlier
        # t1 = threading.Thread(target=Consumer, args=(condition,))
        # t1.start()
            # Thread() method gets name of function / class of which we want to
            # create the thread, and args, which is a tuple of arguments
        # can pass list of Restaurant objects in args or define globally

# condition.notify(), condition.acquire(), condition.release()



"""
define a Consumer class:
        class Consumer(threading.Thread:
            def __init__(self, thingToConsume, condition, lock):
                threading.Thread.__init__(self)
                self.thingToConsume = thingToConsume
                self.condition = condition

            def run(self)
                while True:
                    self.condition.acquire()
                    while True:
                        if self.thingToConsume:
                            thingToConsume = self.thingToConsume.pop()
                            break
                        self.condition.wait()
                    self.condition.release()

in the main() method,
    instantiate the class with the thingToConsume
    t1 = Consumer(restaurant_data, condition, lock)
    t1.start()
    t1.join()
    lock = threading.Lock()

LOCKS
- 2 states, locked and unlocked
- 2 methods to manipulate, acquire() and release()
- if state is unlocked, acquire() changes to locked
- if state is locked, acquire() blocks until another thread calls release()
- if state is unlocked, call to release() raises RuntimeError
- if state is locked, call to release() changes state to unlocked

pass a lock to the Consumer constructor to protect database being modified.


CONDITION
- thread waits for specific condition and another thread (main?) signals that
this condition has happened.
- once condition has happened, thread acquires lock to get exclusive
access to shared resource (like DB)


"""