from linkchecker.api import LinkChecker

def check_links(domain):
    # Configure LinkChecker
    lc = LinkChecker()
    lc.setup()

    try:
        # Crawl the domain
        print(f"Checking links on {domain}...")
        lc.crawl(domain)

        # Get results
        links = lc.get_results()

        print("\nDiscovered links:")
        for link in links:
            print(link)

    except Exception as e:
        print(f"Error: {e}")
    finally:
        # Clean up resources
        lc.teardown()

# Replace with your domain
domain = "https://mcdonalds-mcdelivery.buyflexx.com/10-fast-food-chains-men-voted-have-the-absolute-best-burgers/?utm_campaign=glQ68LuiLP&utm_medium=Kharkiv_4-mc-md1&utm_content=Kharkiv_4-mc-md3&utm_term=Kharkiv_4-mc-md3_120213239999880774&v1=123&v2=123&v3=123&price=38.80&fbclid=PAY2xjawG0PopleHRuA2FlbQEwAGFkaWQBqxVOF3iUZgGmDyeeZ2npGm6OT-2q4KNI12jd2H_l1kFHJu9TGqthCvchWCzNndnJD_rc_aem_z6bvwbUeJ4nRwaCJkd1zlg"
check_links(domain)
