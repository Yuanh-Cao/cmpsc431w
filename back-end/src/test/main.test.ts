import { connect, connected, getUserRepository } from '../dateabase-ops'
import { assert } from "chai"
import { userEmailPasswordCheck, User, UserRole, UserRepository, getProfileByEmail } from '../entities/UserEntities'
import "mocha"

describe("Test database operation", function() {
    before(async function() {
        try {
            await connect("testdb.sqlite");
        } catch (e) {
            console.error(`Initialize Registrar failed with `, e);
            throw e;
        }
    });
    
    it('should successfully initialize the Registrar', async function() {
        assert.isTrue(connected());
    });

    describe("Test user realated function", async function() {

        var user_1: User;
        var userRepo: UserRepository;

        before(async function() {
            userRepo = getUserRepository()

            user_1 = userRepo.create({
                name: "zhangsan",
                role: UserRole.Student,
                email: "123@psu.edu",
                password: "123456",
                gender: "M",
                age: 18
            })
            
            // new User("zhangsan", UserRole.Student)
            // user_1.email = "123@psu.edu"
            // user_1.password = "123456"
            // user_1.gender = "M"
            // user_1.age = 18

            await userRepo.insert(user_1)
        })

        it("Should return ture if email and password is match", async function() {
            const result = await userEmailPasswordCheck("123@psu.edu", "123456");
            assert(result === true)
        })

        it("Should return false if email and password is not match", async function() {
            const result = await userEmailPasswordCheck("123@psu.edu", "1234562222");
            assert(result === false)
        })

        it("Should return user profile correctly", async function() {
            const result = await getProfileByEmail(user_1.email!)
            assert(result["name"] === "zhangsan")
            assert(result["gender"] === "M")
            assert(result["age"] === 18)
        })

        after(async function() {
            await userRepo.removeUser(user_1)
        })
    })


})